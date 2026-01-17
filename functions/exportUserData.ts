import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exportType, format } = await req.json();

    let data = {};
    let filename = '';

    // Fetch relevant data
    if (exportType === 'portfolio' || exportType === 'all') {
      const ideas = await base44.entities.PortfolioIdea.filter({ created_by: user.email });
      data.portfolio = ideas;
      filename = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (exportType === 'transactions' || exportType === 'all') {
      const financialData = await base44.entities.FinancialData?.filter?.({ created_by: user.email }) || [];
      data.transactions = financialData;
      if (!filename) filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (exportType === 'performance' || exportType === 'all') {
      const reports = await base44.entities.PerformanceReport?.filter?.({ created_by: user.email }) || [];
      data.performance = reports;
      if (!filename) filename = `performance_${new Date().toISOString().split('T')[0]}.pdf`;
    }

    // Generate CSV content
    if (format === 'CSV') {
      let csv = '';
      const dataType = exportType === 'portfolio' ? data.portfolio : data.transactions;
      
      if (dataType && dataType.length > 0) {
        const headers = Object.keys(dataType[0]);
        csv = headers.join(',') + '\n';
        csv += dataType.map(row => 
          headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');
      }

      const blob = new TextEncoder().encode(csv);
      return new Response(blob, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return Response.json({
      success: true,
      downloadUrl: '#',
      filename
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});