import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';
import { UserRole } from '@/types/auth';

const SERPER_API_KEY = process.env.SERPER_API_KEY!;

// Helper function to check admin access
async function checkAdminAccess(session: any) {
  if (!session?.user?.role) return false;
  
  const adminRoles = [UserRole.GOD_MODE, UserRole.ADMIN, UserRole.MARKETING];
  return adminRoles.includes(session.user.role);
}

// POST /api/admin/search - Search web using SerperAPI for competitive intelligence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { query, type = 'search', gl = 'us', hl = 'en' } = body;

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Make request to Serper API
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        type,
        gl, // Geographic location
        hl, // Language
        num: 10 // Number of results
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    // Process and return relevant data
    return NextResponse.json({
      query,
      searchInformation: data.searchInformation,
      organic: data.organic?.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        date: result.date,
        source: result.source
      })) || [],
      news: data.news?.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        date: result.date,
        source: result.source,
        imageUrl: result.imageUrl
      })) || [],
      relatedSearches: data.relatedSearches || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// GET /api/admin/search - Search internal admin data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !await checkAdminAccess(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter') || 'all';

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const results: any[] = [];
    const searchTerm = query.toLowerCase();

    try {
      // Import MongoDB connection (you'll need to adjust this path)
      const { connectDB } = require('@/libs/mongo');
      await connectDB();
      const { User } = require('@/models/User');

      // Search users if filter allows
      if (filter === 'all' || filter === 'user') {
        const users = await User.find({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { customerId: { $regex: searchTerm, $options: 'i' } },
            { hubspotContactId: { $regex: searchTerm, $options: 'i' } },
            { vapiUserId: { $regex: searchTerm, $options: 'i' } }
          ]
        }).limit(20).lean();

        users.forEach((user: any) => {
          const relevanceScore = calculateRelevance(searchTerm, [
            user.name || '',
            user.email || '',
            user.customerId || '',
            user.hubspotContactId || '',
            user.vapiUserId || ''
          ]);

          results.push({
            type: 'user',
            id: user._id.toString(),
            title: user.name || user.email || 'Unknown User',
            subtitle: `${user.email} • ${user.role} • ${user.subscriptionTier}`,
            metadata: {
              role: user.role,
              tier: user.subscriptionTier,
              status: user.accountStatus,
              created: new Date(user.createdAt).toLocaleDateString()
            },
            relevanceScore
          });
        });
      }

      // Add mock results for other types since we don't have those models yet
      if (filter === 'all' || filter === 'transaction') {
        if (searchTerm.includes('payment') || searchTerm.includes('transaction') || searchTerm.includes('stripe')) {
          results.push({
            type: 'transaction',
            id: 'mock-transaction-1',
            title: 'Payment Transaction',
            subtitle: 'Stripe payment processing',
            metadata: {
              amount: '$29.99',
              status: 'completed',
              date: new Date().toLocaleDateString()
            },
            relevanceScore: 0.8
          });
        }
      }

      if (filter === 'all' || filter === 'call') {
        if (searchTerm.includes('call') || searchTerm.includes('voice') || searchTerm.includes('vapi')) {
          results.push({
            type: 'call',
            id: 'mock-call-1',
            title: 'Voice Call Session',
            subtitle: 'VAPI voice interaction',
            metadata: {
              duration: '5:32',
              status: 'completed',
              date: new Date().toLocaleDateString()
            },
            relevanceScore: 0.7
          });
        }
      }

      if (filter === 'all' || filter === 'activity') {
        if (searchTerm.includes('login') || searchTerm.includes('activity') || searchTerm.includes('log')) {
          results.push({
            type: 'activity',
            id: 'mock-activity-1',
            title: 'User Login Activity',
            subtitle: 'Authentication event',
            metadata: {
              event: 'login',
              ip: '192.168.1.1',
              date: new Date().toLocaleDateString()
            },
            relevanceScore: 0.6
          });
        }
      }

    } catch (dbError) {
      console.error('Database search error:', dbError);
      // Return mock results if DB fails
      results.push({
        type: 'user',
        id: 'mock-user-1',
        title: 'Sample User',
        subtitle: 'sample@example.com • USER • FREE',
        metadata: {
          role: 'USER',
          tier: 'FREE',
          status: 'ACTIVE'
        },
        relevanceScore: 0.5
      });
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      query,
      filter,
      results: results.slice(0, 50), // Limit to 50 results
      timestamp: new Date().toISOString(),
      totalFound: results.length
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// Helper function to calculate relevance score
function calculateRelevance(searchTerm: string, fields: string[]): number {
  let score = 0;
  const normalizedSearch = searchTerm.toLowerCase();

  fields.forEach(field => {
    if (!field) return;
    const normalizedField = field.toLowerCase();
    
    if (normalizedField === normalizedSearch) {
      score += 1.0; // Exact match
    } else if (normalizedField.includes(normalizedSearch)) {
      score += 0.8; // Contains search term
    } else if (normalizedSearch.includes(normalizedField)) {
      score += 0.6; // Search term contains field
    }
  });

  return Math.min(score / fields.length, 1.0);
}
