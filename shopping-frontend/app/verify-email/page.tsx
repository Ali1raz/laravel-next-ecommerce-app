"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";
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

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  const handleVerify = async () => {
    if (verificationCode.length !== VERIFICATION_CODE_LENGTH) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ApiService.verifyEmail(email, verificationCode);
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsLoading(true);
    try {
      await ApiService.resendVerificationCode(email);
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
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
      toast({
        title: "Failed to Resend",
        description:
          error instanceof Error
            ? error.message
            : "Failed to resend verification code. Please try again.",
        variant: "destructive",
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
              href="/login"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit verification code <br /> sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <InputOTP
                required
                inputMode="numeric"
                pattern={REGEXP_ONLY_DIGITS}
                maxLength={VERIFICATION_CODE_LENGTH}
                id="verification-code"
                value={verificationCode}
                onChange={setVerificationCode}
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
            <div className="flex justify-end">
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={isLoading || resendCountdown > 0}
              >
                {resendCountdown > 0
                  ? `Resend Code (${resendCountdown}s)`
                  : "Resend Code"}
              </Button>
            </div>
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={
                isLoading ||
                verificationCode.length !== VERIFICATION_CODE_LENGTH
              }
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
