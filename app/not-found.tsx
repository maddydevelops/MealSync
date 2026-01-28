// app/not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function NotFound() {
  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-gray-100">
      <Card className="max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-red-600">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">
            The page you are looking for doesn’t exist or has been moved.
          </p>
          <Link href="/">
            <Button variant="default" className="w-full">
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
