"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function OwnerSettingsPage() {
  // Dialog states
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* Profile Card */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your profile information like name, email, and phone number.
          </p>
        </div>
        <div className="mt-4">
          <Button onClick={() => setOpenProfile(true)}>Edit Profile</Button>
        </div>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="First Name" />
            <Input placeholder="Last Name" />
            <Input placeholder="Email" />
            <Input placeholder="Phone Number" />
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenProfile(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TODO: Add other cards for Password, Notifications, Policy, About Us */}
    </div>
  );
}
