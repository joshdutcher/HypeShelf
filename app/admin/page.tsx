"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const allUsers = useQuery(api.users.listUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const [changingRoleFor, setChangingRoleFor] = useState<Id<"users"> | null>(null);

  // Redirect if not admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link
            href="/recommendations"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Recommendations
          </Link>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (userId: Id<"users">, newRole: "user" | "admin") => {
    setChangingRoleFor(userId);
    try {
      await updateUserRole({ userId, role: newRole });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setChangingRoleFor(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  HypeShelf
                </h1>
              </Link>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/recommendations"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Recommendations
              </Link>
              <SignOutButton>
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage user roles and permissions
            </p>
          </div>

          {/* Users List */}
          {allUsers === undefined && (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {allUsers && allUsers.length === 0 && (
            <div className="text-center py-12 rounded-lg border bg-white">
              <p className="text-gray-600">No users found</p>
            </div>
          )}

          {allUsers && allUsers.length > 0 && (
            <div className="space-y-4">
              {allUsers.map((u) => (
                <div
                  key={u._id}
                  className="rounded-lg border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {u.name || "Anonymous"}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                        {u._id === currentUser?._id && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{u.email}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Role Change Buttons */}
                    {u._id !== currentUser?._id && (
                      <div className="flex gap-2">
                        {u.role === "user" ? (
                          <button
                            onClick={() => handleRoleChange(u._id, "admin")}
                            disabled={changingRoleFor === u._id}
                            className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {changingRoleFor === u._id
                              ? "Promoting..."
                              : "Promote to Admin"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u._id, "user")}
                            disabled={changingRoleFor === u._id}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {changingRoleFor === u._id
                              ? "Demoting..."
                              : "Demote to User"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              About Roles
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Admin:</strong> Can delete any recommendation, mark Staff
                Picks, and manage user roles
              </li>
              <li>
                <strong>User:</strong> Can create and delete only their own
                recommendations
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
