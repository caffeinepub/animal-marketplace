import { useState } from 'react';
import { Phone, Mail, Clock, CheckCircle, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FormData {
  fullName: string;
  orderId: string;
  issue: string;
}

interface FormErrors {
  fullName?: string;
  issue?: string;
}

export default function HelplinePage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    orderId: '',
    issue: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.issue.trim()) {
      newErrors.issue = 'Please describe your issue.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ fullName: '', orderId: '', issue: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Hero */}
      <div className="bg-primary py-10 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <HeadphonesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Customer Helpline
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            We're here to help. Fill out the form below and our team will get back to you shortly.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        {/* Contact Form Card */}
        <Card className="shadow-card border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl text-foreground">
              Send Us a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="font-display font-semibold text-xl text-foreground">
                  Message Received!
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  Thank you! We will get back to you shortly. Our support team typically responds within 24 hours.
                </p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="mt-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Order ID (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="orderId" className="text-sm font-medium text-foreground">
                    Order ID{' '}
                    <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="orderId"
                    name="orderId"
                    type="text"
                    placeholder="e.g. ORD-12345"
                    value={formData.orderId}
                    onChange={handleChange}
                  />
                </div>

                {/* Describe your Issue */}
                <div className="space-y-1.5">
                  <Label htmlFor="issue" className="text-sm font-medium text-foreground">
                    Describe your Issue <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="issue"
                    name="issue"
                    placeholder="Please describe your issue in detail so we can assist you better..."
                    value={formData.issue}
                    onChange={handleChange}
                    rows={5}
                    className={errors.issue ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.issue && (
                    <p className="text-destructive text-xs mt-1">{errors.issue}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5"
                >
                  Submit Request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact Details Section */}
        <Card className="shadow-card border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl text-foreground">
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Support Email</p>
                <a
                  href="mailto:irfankhansingboard1998@gmail.com"
                  className="text-primary hover:underline text-sm break-all"
                >
                  irfankhansingboard1998@gmail.com
                </a>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>

            <Separator />

            {/* Helpline Numbers */}
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Helpline Number</p>
                <a
                  href="tel:7829297025"
                  className="text-primary hover:underline text-sm font-medium block"
                >
                  7829297025
                </a>
                <a
                  href="tel:8431207976"
                  className="text-primary hover:underline text-sm font-medium block mt-0.5"
                >
                  8431207976
                </a>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Available: 10 AM – 6 PM (Mon–Sat)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
