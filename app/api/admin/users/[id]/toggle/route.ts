import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth/auth";
import { toggleUserStatus, getUserById } from "@/lib/database/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;

    // Prevent admin from deactivating themselves
    if (userId === currentUser.id) {
      return NextResponse.json(
        { message: "Cannot change your own status" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Toggle user status
    const updatedUser = await toggleUserStatus(userId);
    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update user status" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
