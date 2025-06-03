import { NextRequest, NextResponse } from "next/server";
import {
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  setDefaultConfiguration,
} from "@/lib/database/db";
import { getCurrentUserFromRequest } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get current user
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const configuration = await getConfiguration(params.id);

    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 },
      );
    }

    // Check if user owns this configuration
    if (configuration.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get current user
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if configuration exists and user owns it
    const existingConfig = await getConfiguration(params.id);
    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 },
      );
    }
    if (existingConfig.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, config, isDefault } = body;

    const updatedConfiguration = await updateConfiguration(params.id, {
      name,
      description,
      config,
      isDefault,
    });

    if (!updatedConfiguration) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 },
      );
    }

    // If setting as default, update the default flag
    if (isDefault) {
      await setDefaultConfiguration(params.id);
    }

    return NextResponse.json(updatedConfiguration);
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Get current user
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if configuration exists and user owns it
    const existingConfig = await getConfiguration(params.id);
    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 },
      );
    }
    if (existingConfig.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const deleted = await deleteConfiguration(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 },
    );
  }
}
