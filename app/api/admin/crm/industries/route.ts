import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../libs/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Standard industry options commonly used in HubSpot
    const industries = [
      'Advertising',
      'Agriculture',
      'Automotive',
      'Banking',
      'Biotechnology',
      'Construction',
      'Consulting',
      'Education',
      'Engineering',
      'Entertainment',
      'Finance',
      'Government',
      'Healthcare',
      'Hospitality',
      'Insurance',
      'Legal',
      'Manufacturing',
      'Marketing',
      'Media',
      'Non-profit',
      'Other',
      'Pharmaceutical',
      'Real Estate',
      'Retail',
      'Software',
      'Technology',
      'Telecommunications',
      'Transportation',
      'Utilities'
    ].sort();

    return NextResponse.json({ industries });
  } catch (error) {
    console.error('Industries API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}
