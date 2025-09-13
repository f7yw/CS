"use client"

import { FileText, AlertTriangle, Scale, Users, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-semibold text-[var(--color-foreground)] mb-4">Terms of Service</h1>
          <p className="text-xl text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Please read these terms carefully before using NextStep Navigator.
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-4">Last updated: January 2024</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-[var(--color-primary)]" />
                <span className="text-[var(--color-foreground)]">Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)]">
                By accessing and using NextStep Navigator, you accept and agree to be bound by the terms and provision
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-[var(--color-primary)]" />
                <span className="text-[var(--color-foreground)]">Use License</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--color-muted-foreground)]">
                Permission is granted to temporarily access NextStep Navigator for personal, non-commercial transitory
                viewing only. This is the grant of a license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-[var(--color-primary)]" />
                <span className="text-[var(--color-foreground)]">User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)] mb-4">As a user of NextStep Navigator, you agree to:</p>
              <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
                <li>Provide accurate and truthful information</li>
                <li>Use the service for lawful purposes only</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not interfere with or disrupt the service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-[var(--color-destructive)]" />
                <span className="text-[var(--color-foreground)]">Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[var(--color-muted-foreground)]">
                The materials on NextStep Navigator are provided on an 'as is' basis. NextStep Navigator makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <div className="bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/20 rounded-lg p-4">
                <h3 className="font-semibold text-[var(--color-destructive)] mb-2">Career Guidance Disclaimer</h3>
                <p className="text-[var(--color-destructive)] text-sm">
                  The career guidance and recommendations provided are for informational purposes only. Individual
                  results may vary, and we recommend consulting with professional career counselors for personalized
                  advice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)]">Limitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)]">
                In no event shall NextStep Navigator or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the use
                or inability to use the materials on NextStep Navigator, even if NextStep Navigator or an authorized
                representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-[var(--color-primary)]" />
                <span className="text-[var(--color-foreground)]">Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)]">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                service, to understand our practices.
              </p>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)]">Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)]">
                NextStep Navigator may revise these terms of service at any time without notice. By using this website,
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)]">Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-muted-foreground)]">
                These terms and conditions are governed by and construed in accordance with the laws of the United
                States and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
