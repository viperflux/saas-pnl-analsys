import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/db";
import { growthScenarios } from "@/lib/database/schema";
import { getCurrentUserFromRequest } from "@/lib/auth/auth";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      console.error("No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required. Please log in first." },
        { status: 401 }
      );
    }

    console.log("Fetching scenarios for user:", user.id);
    const scenarios = await db.select().from(growthScenarios)
      .where(eq(growthScenarios.userId, user.id))
      .orderBy(desc(growthScenarios.isDefault), desc(growthScenarios.createdAt));

    console.log("Found scenarios:", scenarios.length);
    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      console.error("No authenticated user found for POST request");
      return NextResponse.json(
        { error: "Authentication required. Please log in first." },
        { status: 401 }
      );
    }

    console.log("Creating scenario for user:", user.id);
    const body = await request.json();
    const { 
      name, 
      description, 
      growthRates, 
      seasonalModifiers, 
      isDefault = false,
      configurationId 
    } = body;

    if (!name || !growthRates) {
      return NextResponse.json(
        { error: "Name and growth rates are required" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.update(growthScenarios)
        .set({ isDefault: false })
        .where(eq(growthScenarios.userId, user.id));
    }

    const scenarioId = uuidv4();
    console.log("Inserting scenario with ID:", scenarioId);
    const [result] = await db.insert(growthScenarios).values({
      id: scenarioId,
      userId: user.id,
      configurationId: configurationId || null,
      name,
      description,
      growthRates: JSON.stringify(growthRates),
      seasonalModifiers: seasonalModifiers ? JSON.stringify(seasonalModifiers) : null,
      isDefault
    }).returning();

    console.log("Successfully created scenario:", result.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating scenario:", error);
    return NextResponse.json(
      { error: "Failed to create scenario", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      id,
      name, 
      description, 
      growthRates, 
      seasonalModifiers, 
      isDefault = false 
    } = body;

    if (!id || !name || !growthRates) {
      return NextResponse.json(
        { error: "ID, name and growth rates are required" },
        { status: 400 }
      );
    }

    // Check ownership
    const [existingScenario] = await db.select().from(growthScenarios)
      .where(and(eq(growthScenarios.id, id), eq(growthScenarios.userId, user.id)));

    if (!existingScenario) {
      return NextResponse.json(
        { error: "Scenario not found or access denied" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.update(growthScenarios)
        .set({ isDefault: false })
        .where(and(eq(growthScenarios.userId, user.id), eq(growthScenarios.id, id)));
    }

    const [result] = await db.update(growthScenarios)
      .set({
        name,
        description,
        growthRates: JSON.stringify(growthRates),
        seasonalModifiers: seasonalModifiers ? JSON.stringify(seasonalModifiers) : null,
        isDefault
      })
      .where(and(eq(growthScenarios.id, id), eq(growthScenarios.userId, user.id)))
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Failed to update scenario" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("id");

    if (!scenarioId) {
      return NextResponse.json(
        { error: "Scenario ID is required" },
        { status: 400 }
      );
    }

    // Check ownership and prevent deletion of default scenarios
    const [existingScenario] = await db.select().from(growthScenarios)
      .where(and(eq(growthScenarios.id, scenarioId), eq(growthScenarios.userId, user.id)));

    if (!existingScenario) {
      return NextResponse.json(
        { error: "Scenario not found or access denied" },
        { status: 404 }
      );
    }

    if (existingScenario.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default scenario" },
        { status: 400 }
      );
    }

    await db.delete(growthScenarios)
      .where(and(eq(growthScenarios.id, scenarioId), eq(growthScenarios.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Failed to delete scenario" },
      { status: 500 }
    );
  }
}