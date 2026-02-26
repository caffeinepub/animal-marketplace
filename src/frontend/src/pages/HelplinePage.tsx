import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Phone, Mail, Clock, ChevronRight, ArrowLeft, MessageSquare, Star, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function HelplinePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitted(true);
    toast.success('Message sent! We will get back to you soon.');
  };

  const menuItems = [
    {
      icon: MessageSquare,
      title: 'Help Center',
      subtitle: 'See FAQ and contact support',
      showChevron: true,
    },
    {
      icon: Star,
      title: 'Rate us',
      subtitle: 'If you love our app, please take a moment to rate it',
      showChevron: true,
    },
    {
      icon: Users,
      title: 'Invite friends to Animal Pashu Bazar',
      subtitle: 'Invite your friends to buy and sell',
      showChevron: false,
    },
    {
      icon: Shield,
      title: 'Become a beta tester',
      subtitle: 'Test new features in advance',
      showChevron: true,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={() => navigate({ to: '/profile' })} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>
      </div>

      {/* Contact Details Section */}
      <div className="px-4 py-5 bg-blue-50 border-b border-blue-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Contact Details</h2>

        {/* Call Admin Button */}
        <a
          href="tel:8431207976"
          className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-4 rounded-xl font-bold text-base shadow-md hover:bg-primary/90 transition-colors mb-3"
        >
          <Phone className="h-5 w-5" />
          Call Admin for Ad Approval
        </a>

        <div className="space-y-2">
          <a
            href="tel:7829297025"
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">+91 7829297025</p>
              <p className="text-xs text-gray-500">Helpline Number</p>
            </div>
          </a>

          <a
            href="tel:8431207976"
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">+91 8431207976</p>
              <p className="text-xs text-gray-500">Admin / Ad Approval</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">irfankhansingboard1998@gmail.com</p>
              <p className="text-xs text-gray-500">Support Email</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">10 AM – 6 PM</p>
              <p className="text-xs text-gray-500">Mon–Sat availability</p>
            </div>
          </div>
        </div>
      </div>

      {/* OLX-style menu items */}
      <div className="bg-white">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title}>
              <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
                {item.showChevron && <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          );
        })}
        <Separator />
        <div className="px-4 py-4">
          <p className="text-sm font-semibold text-gray-900">Version</p>
          <p className="text-xs text-gray-500 mt-0.5">52</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="px-4 py-5 border-t border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Send a Message</h2>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Message Sent!</p>
            <p className="text-sm text-gray-500 mt-1">We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                rows={4}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
