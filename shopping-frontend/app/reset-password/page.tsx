"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Lock, Loader2, Mail, Key } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ApiService } from "@/lib/api";

const VERIFICATION_CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    if (!code.trim()) {
      toast.error("Reset code required", {
        description: "Please enter the reset code sent to your email",
      });
      return;
    }

    if (!password.trim()) {
      toast.error("Password required", {
        description: "Please enter your new password",
      });
      return;
    }

    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords don't match", {
        description: "Please make sure your passwords match",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.resetPassword({
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password reset successful", {
        description:
          "Your password has been reset successfully. You can now log in with your new password.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Reset failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Please check your email and reset code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || !email.trim()) return;

    setIsLoading(true);
    try {
      await ApiService.forgotPassword(email.trim());
      toast.success("Reset code sent", {
        description: "A new reset code has been sent to your email",
      });
      setResendCountdown(RESEND_COOLDOWN);
      const timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to send reset code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to forgot password
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email, reset code, and new password <br /> to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center relative">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Reset Code</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isLoading || resendCountdown > 0 || !email.trim()}
                  className="text-xs"
                >
                  {resendCountdown > 0
                    ? `Resend Code (${resendCountdown}s)`
                    : "Resend Code"}
                </Button>
              </div>
              <div className="relative">
                <InputOTP
                  required
                  inputMode="numeric"
                  pattern={REGEXP_ONLY_DIGITS}
                  maxLength={VERIFICATION_CODE_LENGTH}
                  id="code"
                  value={code}
                  onChange={setCode}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground">
                Check your email for the 6-digit reset code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="flex items-center relative">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={8}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirmation">
                Confirm New Password
              </Label>
              <div className="flex items-center relative">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password-confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={8}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  disabled={isLoading}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
