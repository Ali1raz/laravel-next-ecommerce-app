"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiService, type User } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { UserIcon, Mail, Calendar, Shield, Edit } from "lucide-react";
import { ProfileModal } from "@/components/profile-model";

export default function BuyerProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const data = await ApiService.getProfile();
      setUser(data);
      AuthService.setUser(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  if (isLoading) {
    return <LoadingSkeleton type="profile" />;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Profile Not Found</h3>
          <p className="text-muted-foreground text-center">
            Unable to load your profile information. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserRole = () => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return "buyer";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your basic account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">Full Name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">Email Address</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {formatDate(user.created_at || null)}
                </p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="capitalize">
                  {getUserRole()}
                </Badge>
                <p className="text-sm text-muted-foreground">Account Type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Detailed information about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Account Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        user.email_verified_at ? "default" : "destructive"
                      }
                    >
                      {user.email_verified_at ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {getUserRole()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Member Since</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(user.created_at || null)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(user.updated_at || null)}
                </p>
              </div>

              {user.roles && user.roles.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.roles[0].permissions?.map((permission) => (
                      <Badge
                        key={permission.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {permission.name}
                      </Badge>
                    )) || (
                      <p className="text-sm text-muted-foreground">
                        No specific permissions assigned
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfileModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}
