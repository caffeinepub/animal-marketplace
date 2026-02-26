import { ShieldCheck, AlertTriangle, Info, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const terms = [
  {
    icon: <UserCheck className="w-6 h-6 text-primary" />,
    title: 'Honest Information',
    text: 'Users must provide honest information about animals.',
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
    title: 'No Illegal Trading',
    text: 'Illegal trading of wild animals is strictly prohibited.',
  },
  {
    icon: <Info className="w-6 h-6 text-primary" />,
    title: 'Platform Disclaimer',
    text: 'Animal Pashu Bazar is only a platform; we are not responsible for any fraud between buyer and seller.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: 'Admin Rights',
    text: 'Admin has the right to remove any post if found suspicious.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-muted-foreground text-sm">
            Please read these terms carefully before using Animal Pashu Bazar.
          </p>
        </div>

        {/* Terms List */}
        <div className="flex flex-col gap-4">
          {terms.map((term, index) => (
            <Card key={index} className="border border-border shadow-card">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {term.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      {index + 1}
                    </span>
                    <h2 className="font-display font-semibold text-foreground text-base">
                      {term.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{term.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By using Animal Pashu Bazar, you agree to abide by these terms and conditions.
        </p>
      </div>
    </div>
  );
}
