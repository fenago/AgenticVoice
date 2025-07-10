'use client';

import { useSession } from 'next-auth/react';
import { Card, Button, Badge } from '@/components/ui';
import { Phone, MessageSquare, Calendar, Settings, BarChart3, Clock, Ticket } from 'lucide-react';

export default function CustomerPage() {
  const { data: session } = useSession();

  const assistants = [
    {
      id: 1,
      name: "Dr. Smith's Reception Assistant",
      type: "Medical",
      status: "active",
      calls: 156,
      avgDuration: "2:30",
      description: "Handles appointment scheduling and basic inquiries"
    },
    {
      id: 2,
      name: "Legal Intake Assistant",
      type: "Legal", 
      status: "active",
      calls: 89,
      avgDuration: "4:15",
      description: "Processes initial client consultations"
    }
  ];

  const recentCalls = [
    {
      id: 1,
      phone: "+1 (555) 123-4567",
      duration: "3:45",
      outcome: "Appointment scheduled",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      phone: "+1 (555) 987-6543", 
      duration: "1:20",
      outcome: "Information provided",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      phone: "+1 (555) 456-7890",
      duration: "5:30",
      outcome: "Consultation booked",
      timestamp: "6 hours ago"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Portal</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900">245</p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assistants</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-3xl font-bold text-gray-900">3:22</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">94%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Assistants */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your AI Assistants</h2>
            <Button variant="primary" size="sm">Add Assistant</Button>
          </div>
          
          <div className="space-y-4">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{assistant.name}</h3>
                    <p className="text-sm text-gray-600">{assistant.description}</p>
                  </div>
                  <Badge variant={assistant.status === 'active' ? 'success' : 'secondary'}>
                    {assistant.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{assistant.calls} calls</span>
                  <span>Avg: {assistant.avgDuration}</span>
                  <Badge variant="info">{assistant.type}</Badge>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm">Configure</Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Calls */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Calls</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div key={call.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{call.phone}</span>
                  <span className="text-sm text-gray-500">{call.timestamp}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Duration: {call.duration}</span>
                    <Badge variant="success">{call.outcome}</Badge>
                  </div>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" className="h-16">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Assistant Training
          </Button>
          <Button variant="outline" className="h-16">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" className="h-16">
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </Button>
          <Button 
            variant="outline" 
            className="h-16"
            onClick={() => window.location.href = '/customer/tickets'}
          >
            <Ticket className="w-5 h-5 mr-2" />
            Support Tickets
          </Button>
        </div>
      </Card>
    </div>
  );
}
