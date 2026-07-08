"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setCurrentUser(d.user);
      setQrUrl(`${window.location.origin}/borrow`);
    });
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) setUsers(data.users);
  };

  const handleCreateUser = async () => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword, email: newEmail, role: newRole }),
    });
    setShowAddUser(false);
    setNewUsername("");
    setNewPassword("");
    setNewEmail("");
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0a0b0d]">Settings</h2>

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>Scan to access the borrowing page</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-block bg-white p-4 rounded-xl border mb-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-[#5b616e] mb-3">
            URL: <span className="font-mono text-[#0052ff]">{qrUrl}</span>
          </p>
        </CardContent>
      </Card>

      {/* Admin Users Card */}
      {currentUser?.role === "super_admin" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage admin accounts</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddUser(!showAddUser)}>
              {showAddUser ? "Cancel" : "Add Admin"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddUser && (
              <div className="bg-[#f7f7f7] rounded-[24px] p-4 space-y-3 mb-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Username</Label>
                    <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Role</Label>
                    <select
                      className="flex h-12 w-full rounded-[12px] border border-[#dee1e6] bg-white px-4 py-3.5 text-base text-[#0a0b0d] focus:outline-none focus:border-[#0052ff] focus:border-2 transition-colors"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <Button size="sm" onClick={handleCreateUser} disabled={!newUsername || !newPassword}>
                  Save
                </Button>
              </div>
            )}

            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-[#f7f7f7] rounded-[12px] p-3">
                <div>
                  <p className="font-medium text-sm text-[#0a0b0d]">{u.username}</p>
                  <p className="text-xs text-[#7c828a]">{u.email} • {u.role}</p>
                </div>
                {u.role !== "super_admin" && (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
