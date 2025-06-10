import { Shield, Users } from "lucide-react";

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export const getRoleColor = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case "admin":
      return "destructive";
    case "seller":
      return "default";
    case "buyer":
      return "secondary";
    default:
      return "outline";
  }
};

export const getRoleIcon = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case "admin":
      return Shield;
    case "seller":
      return Users;
    case "buyer":
      return Users;
    default:
      return Shield;
  }
};
