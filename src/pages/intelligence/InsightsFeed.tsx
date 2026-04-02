// Formal Intelligence Template - Updated
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  getMarketNarratives, 
  getFeaturedNarratives,
  getNarrativeStats,
  type MarketNarrative 
} from '../../services/narratives.service';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Eye, 
  Calendar,
  MapPin,
  Star,
  RefreshCw,
  Filter,
  ArrowLeft
} from '../../lib/icons';
import { toast } from '../../components/ui/Toast';

export default function InsightsFeed() {
  const navigate = useNavigate();
  const [narratives, setNarratives] = useState<MarketNarrative[]>([]);
  const [featured, setFeatured] = useState<MarketNarrative[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [expandedNarrative, setExpandedNarrative] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedLocation, selectedType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [narrativesData, featuredData, statsData] = await Promise.all([
        getMarketNarratives({
          location: selectedLocation || undefined,
          narrative_type: selectedType || undefined,
          limit: 50
        }),
        getFeaturedNarratives(3),
        getNarrativeStats(selectedLocation || undefined)
      ]);
      setNarratives(narrativesData);
      setFeatured(featuredData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading narratives:', error);
      toast('error', 'Failed to load market insights');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Calendar className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'insight':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Parse markdown content into formatted sections
  const parseMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const sections: { title: string; content: string[]; level: number }[] = [];
    let currentSection: { title: string; content: string[]; level: number } | null = null;

    lines.forEach(line => {
      // Check for headers
      if (line.startsWith('# ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line.replace('# ', ''), content: [], level: 1 };
      } else if (line.startsWith('## ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line.replace('## ', ''), content: [], level: 2 };
      } else if (line.startsWith('### ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: line.replace('### ', ''), content: [], level: 3 };
      } else if (line.trim() && currentSection) {
        currentSection.content.push(line);
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const locations = ['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Muhanga'];
  const narrativeTypes = ['weekly', 'monthly', 'alert', 'insight', 'special'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/home')} 
          className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Formal Header with Letterhead Style */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 mb-10 overflow-hidden">
          {/* 3px Top Border Accent */}
          <div className="h-3 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600"></div>
          
          <div className="p-10">
            {/* Letterhead */}
            <div className="flex items-start justify-between mb-8 pb-8 border-b-2 border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
                      Market Intelligence Report
                    </h1>
                    <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">
                      Rwanda Economic Price Index • Intelligence Division
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mt-6 pl-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">Report Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">Total Reports:</span>
                    <span className="font-bold text-gray-900">{stats?.total || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">Total Readership:</span>
                    <span className="font-bold text-gray-900">{stats?.totalViews?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                className="flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-accent-50 rounded-xl p-8 border-2 border-primary-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
              </div>
              
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full mb-3 shadow-md">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{stats.byType.weekly}</p>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Weekly Reports</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-3 shadow-md">
                      <AlertCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{stats.byType.alert}</p>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Critical Alerts</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-600 to-accent-700 rounded-full mb-3 shadow-md">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{stats.byType.insight}</p>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Market Insights</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-full mb-3 shadow-md">
                      <Eye className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-1">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Total Views</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Reports Section */}
        {featured.length > 0 && (
          <div className="mb-10">
            {/* Amber Gradient Divider with Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg">
                <Star className="w-6 h-6 text-white fill-current" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Featured Intelligence</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map(narrative => (
                <div 
                  key={narrative.id}
                  onClick={() => setExpandedNarrative(expandedNarrative === narrative.id ? null : narrative.id)}
                  className="cursor-pointer group"
                >
                  <Card className="h-full bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-300 hover:border-amber-500 overflow-hidden">
                    {/* Amber Ribbon Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-white fill-current" />
                        <span className="text-white font-bold text-xs uppercase tracking-wider">Featured Report</span>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold">
                        {narrative.narrative_type}
                      </Badge>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {narrative.title}
                      </h3>
                      
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                        {narrative.summary}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{narrative.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{narrative.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(narrative.published_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Filter className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Filter Intelligence Reports</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Report Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">All Types</option>
                {narrativeTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Displaying <span className="font-bold text-gray-900 text-lg">{narratives.length}</span> intelligence reports
            </p>
          </div>
        </Card>

        {/* Narratives List */}
        {narratives.length === 0 ? (
          <EmptyState
            title="No intelligence reports available"
            description="Market intelligence reports will appear here as they are generated. Check back soon for the latest insights."
          />
        ) : (
          <div className="space-y-6">
            {narratives.map(narrative => (
              <Card 
                key={narrative.id} 
                className="bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-600 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl border-2 border-primary-200">
                        {getTypeIcon(narrative.narrative_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-primary-100 text-primary-800 border-2 border-primary-300 font-bold uppercase tracking-wide">
                            {narrative.narrative_type}
                          </Badge>
                          {narrative.featured && (
                            <Badge className="bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center gap-1 font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {narrative.title}
                        </h3>
                        
                        <p className="text-gray-700 text-lg leading-relaxed mb-4">
                          {narrative.summary}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4 border-t-2 border-gray-200">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">Location:</span>
                            <span>{narrative.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">Views:</span>
                            <span>{narrative.views}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">Published:</span>
                            <span>{new Date(narrative.published_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {narrative.sectors && narrative.sectors.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Sectors:</span>
                              <span className="capitalize">{narrative.sectors.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content - Formal Report */}
                  {expandedNarrative === narrative.id && (
                    <div className="mb-6">
                      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
                        {/* Report Header with Gradient Border */}
                        <div className="h-2 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600"></div>
                        
                        <div className="p-10">
                          {/* Report Title Section */}
                          <div className="mb-8 pb-6 border-b-2 border-gray-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-md">
                                <FileText className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h4 className="text-3xl font-bold text-gray-900 tracking-tight">
                                  {narrative.title}
                                </h4>
                                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider mt-1">
                                  Full Intelligence Report • {narrative.location}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Parsed Markdown Content */}
                          <div className="space-y-8">
                            {parseMarkdownContent(narrative.full_narrative).map((section, idx) => (
                              <div key={idx} className="space-y-4">
                                {/* Section Header */}
                                {section.level === 1 && (
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary-100 rounded-lg">
                                      <FileText className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <h5 className="text-2xl font-bold text-gray-900">{section.title}</h5>
                                  </div>
                                )}
                                
                                {section.level === 2 && (
                                  <div className="flex items-center gap-3 mb-3 mt-6">
                                    <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                                    <h6 className="text-xl font-bold text-gray-900">{section.title}</h6>
                                  </div>
                                )}
                                
                                {section.level === 3 && (
                                  <h6 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h6>
                                )}

                                {/* Section Content */}
                                <div className="space-y-3">
                                  {section.content.map((line, lineIdx) => {
                                    // Handle bullet points
                                    if (line.trim().startsWith('-')) {
                                      return (
                                        <div key={lineIdx} className="flex items-start gap-3 ml-4">
                                          <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
                                          <p className="text-gray-700 leading-relaxed flex-1">
                                            {line.trim().substring(1).trim()}
                                          </p>
                                        </div>
                                      );
                                    }
                                    
                                    // Handle bold text **text**
                                    const boldRegex = /\*\*(.*?)\*\*/g;
                                    const parts = line.split(boldRegex);
                                    
                                    return (
                                      <p key={lineIdx} className="text-gray-700 leading-relaxed text-base">
                                        {parts.map((part, partIdx) => 
                                          partIdx % 2 === 1 ? (
                                            <strong key={partIdx} className="font-bold text-gray-900">{part}</strong>
                                          ) : (
                                            <span key={partIdx}>{part}</span>
                                          )
                                        )}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Key Insights Section */}
                          {narrative.key_insights && narrative.key_insights.length > 0 && (
                            <div className="mt-10 pt-8 border-t-2 border-gray-200">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-accent-100 rounded-lg">
                                  <TrendingUp className="w-6 h-6 text-accent-600" />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">Key Intelligence Insights</h4>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {narrative.key_insights.map((insight: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg border-l-4 border-l-accent-600">
                                    <span className="flex-shrink-0 w-8 h-8 bg-accent-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                                      {idx + 1}
                                    </span>
                                    <p className="text-gray-800 flex-1 leading-relaxed font-medium">
                                      {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Report Footer */}
                          <div className="mt-10 pt-6 border-t-2 border-gray-200">
                            <p className="text-sm text-gray-600 italic">
                              This analysis is based on real-time price data from our marketplace. All data is processed using our transparent methodology.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="flex gap-3">
                    <Button
                      variant={expandedNarrative === narrative.id ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => setExpandedNarrative(expandedNarrative === narrative.id ? null : narrative.id)}
                      className="font-semibold"
                    >
                      {expandedNarrative === narrative.id ? 'Collapse Report' : 'Read Full Report'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
