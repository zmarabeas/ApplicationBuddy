import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

export default function StatusPage() {
  const services = [
    {
      name: "Web Application",
      status: "operational",
      description: "Main web application and dashboard",
      uptime: "99.9%"
    },
    {
      name: "Chrome Extension",
      status: "operational", 
      description: "Browser extension for form filling",
      uptime: "99.8%"
    },
    {
      name: "API Services",
      status: "operational",
      description: "Backend API and data processing",
      uptime: "99.7%"
    },
    {
      name: "Resume Parser",
      status: "operational",
      description: "AI-powered resume parsing service",
      uptime: "99.5%"
    },
    {
      name: "Authentication",
      status: "operational",
      description: "User authentication and authorization",
      uptime: "99.9%"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "outage":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "maintenance":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case "outage":
        return <Badge className="bg-red-100 text-red-800">Outage</Badge>;
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800">Maintenance</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
    }
  };

  return (
    <PublicPageLayout title="System Status">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              All Systems Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All ApplicationBuddy services are currently running normally. 
              We're monitoring our systems 24/7 to ensure reliable service.
            </p>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Uptime: {service.uptime}</span>
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Scheduled Maintenance</h3>
                  <span className="text-sm text-muted-foreground">January 15, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Routine maintenance completed successfully. All services restored.
                </p>
                <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">API Performance Improvement</h3>
                  <span className="text-sm text-muted-foreground">January 10, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Minor performance degradation detected and resolved within 30 minutes.
                </p>
                <Badge className="bg-green-100 text-green-800">Resolved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you're experiencing issues not reflected in our status page, 
              please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.location.href = '/help'}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Visit Help Center
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:support@applicationbuddy.com'}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Contact Support
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  );
} 