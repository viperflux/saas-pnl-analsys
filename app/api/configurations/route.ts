import { NextRequest, NextResponse } from "next/server";
import {
  db,
  createConfiguration,
  getAllConfigurations,
  getDefaultConfiguration,
  getUserConfigurations,
} from "@/lib/database/db";
import { getCurrentUserFromRequest } from "@/lib/auth/auth";
import { DEFAULT_CONFIG } from "@/lib/utils/config";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") || uuidv4();

    // Get current user
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const configurations = await getUserConfigurations(user.id);

    // If no configurations exist for this user, create a default one
    if (configurations.length === 0) {
      const defaultConfig = await createConfiguration({
        userId: user.id,
        name: "Default Configuration",
        description: "Default SaaS financial configuration",
        isDefault: true,
        config: DEFAULT_CONFIG,
      });
      return NextResponse.json({
        configurations: [defaultConfig],
        sessionId,
        currentConfig: defaultConfig,
      });
    }

    // Get default configuration for this user
    const defaultConfig =
      configurations.find((c) => c.isDefault) || configurations[0];

    return NextResponse.json({
      configurations,
      sessionId,
      currentConfig: defaultConfig,
    });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, config, isDefault = false } = body;

    if (!name || !config) {
      return NextResponse.json(
        { error: "Name and config are required" },
        { status: 400 },
      );
    }

    // Get current user
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const newConfiguration = await createConfiguration({
      userId: user.id,
      name,
      description,
      config,
      isDefault,
    });

    return NextResponse.json(newConfiguration);
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 },
    );
  }
}
