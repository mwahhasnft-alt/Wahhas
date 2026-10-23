
import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Play, Pause, AlertTriangle, FileText, Check, X, 
  Settings, Server, Globe, Shield, RefreshCw, ChevronRight, Activity, Save, Upload, Code, Zap, Eye, CheckCircle, BarChart3, Link as LinkIcon, Wand2, Cloud, Download, UploadCloud
} from 'lucide-react';
import { ScrapeJob, ScrapeSource, IngestedListing, ScrapeLog, SremConfig, SremIndicator, SyncRun, CloudConfig } from '../../types';
import { AdminService } from '../../services/adminService';
import { SremService } from '../../services/sremService';
import { CloudService } from '../../services/cloudService';
import { MockMarketService } from '../../services/mockMarketService';

interface DataControlModalProps {
  onClose: () => void;
}

type Tab = 'overview' | 'sources' | 'jobs' | 'import' | 'review' | 'logs' | 'srem' | 'cloud';

const DataControlModal: React.FC<DataControlModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sources, setSources] = useState<ScrapeSource[]>([]);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [ingested, setIngested] = useState<IngestedListing[]>([]);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for running jobs
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  // Modal Form States
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [testSourceId, setTestSourceId] = useState('');

  // Load Data
  const loadData = async () => {
    // We don't set global loading true here to avoid flickering on polls
    const [s, j, i, l] = await Promise.all([
      AdminService.getSources(),
      AdminService.getJobs(),
      AdminService.getIngestedListings(),
      AdminService.getLogs()
    ]);
    setSources(s);
    setJobs(j);
    setIngested(i);
    setLogs(l);
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  // Poll for logs if a job is running
  useEffect(() => {
      let interval: any;
      if (runningJobId) {
          interval = setInterval(() => {
              loadData(); // Poll for updates
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [runningJobId]);

  const handleRunJob = async (jobId: string, dryRun = false) => {
    setRunningJobId(jobId);
    if (dryRun) {
        alert("Starting dry run... Listings will be generated but not saved to database.");
    }
    
    // We don't await here directly if we want UI to update immediately, 
    // but runJob is async. We want to catch the end.
    try {
        await AdminService.runJob(jobId, dryRun);
    } catch (e) {
        console.error(e);
    } finally {
        setRunningJobId(null);
        loadData(); // Final refresh
        if (dryRun) alert("Dry run complete. Check logs.");
    }
  };

  const handleImport = async (data: any[]) => {
    const count = await AdminService.importListings(data);
    await loadData();
    return count;
  };

  const handleApprove = async (id: string) => {
    await AdminService.approveListing(id);
    await loadData();
  };

  const handleApproveAll = async () => {
    const count = await AdminService.approveAllListings();
    await loadData();
    if (count > 0) alert(`Approved and published ${count} listings to the main database.`);
  };

  const handleReject = async (id: string) => {
    await AdminService.rejectListing(id);
    await loadData();
  };

  const handleSaveSource = async (sourceData: any) => {
    const newSource: ScrapeSource = {
        id: `src_${Date.now()}`,
        status: 'active',
        lastCrawl: undefined,
        name: sourceData.name,
        baseUrl: sourceData.baseUrl,
        allowedDomains: sourceData.allowedDomains.split(',').map((d: string) => d.trim()),
        robotsRespect: sourceData.robotsRespect,
        renderJs: sourceData.renderJs,
        rateLimitPerMin: Number(sourceData.rateLimitPerMin) || 60,
        selectors: sourceData.selectors,
        notes: sourceData.notes
    };
    await AdminService.addSource(newSource);
    await loadData();
    setIsAddSourceOpen(false);
  };

  const handleSaveJob = async (jobData: any) => {
    const newJob: ScrapeJob = {
        id: `job_${Date.now()}`,
        sourceId: jobData.sourceId,
        name: jobData.name,
        mode: jobData.mode,
        schedule: jobData.schedule,
        status: 'idle',
        lastRun: undefined,
        metrics: { pagesFetched: 0, successRate: 0, listingsExtracted: 0 }
    };
    await AdminService.addJob(newJob);
    await loadData();
    setIsAddJobOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Data Control Center</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin Access Only</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar Tabs */}
        <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 space-y-1">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Activity} label="Overview" />
            <TabButton active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} icon={Cloud} label="Cloud Connection" />
            <TabButton active={activeTab === 'srem'} onClick={() => setActiveTab('srem')} icon={BarChart3} label="SREM Integration" />
            <TabButton active={activeTab === 'sources'} onClick={() => setActiveTab('sources')} icon={Globe} label="Source Manager" />
            <TabButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={Server} label="Scrape Jobs" />
            <TabButton active={activeTab === 'import'} onClick={() => setActiveTab('import')} icon={Upload} label="Import Data" />
            <TabButton active={activeTab === 'review'} onClick={() => setActiveTab('review')} icon={FileText} label="Review Queue" count={ingested.filter(i => i.status === 'draft').length} />
            <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={AlertTriangle} label="System Logs" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
            {loading && !ingested.length ? (
                <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && <OverviewTab sources={sources} jobs={jobs} ingested={ingested} />}
                    {activeTab === 'cloud' && <CloudTab />}
                    {activeTab === 'srem' && <SremTab />}
                    {activeTab === 'sources' && <SourcesTab sources={sources} onAdd={() => setIsAddSourceOpen(true)} onTest={(id: string) => { setTestSourceId(id); setIsTesterOpen(true); }} />}
                    {activeTab === 'jobs' && <JobsTab jobs={jobs} sources={sources} onRun={handleRunJob} onAdd={() => setIsAddJobOpen(true)} runningJobId={runningJobId} />}
                    {activeTab === 'import' && <ImportTab onImport={handleImport} />}
                    {activeTab === 'review' && <ReviewTab listings={ingested} onApprove={handleApprove} onReject={handleReject} onApproveAll={handleApproveAll} />}
                    {activeTab === 'logs' && <LogsTab logs={logs} />}
                </>
            )}
        </div>
      </div>

      {/* Add Source Modal Overlay */}
      {isAddSourceOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <AddSourceForm 
                onClose={() => setIsAddSourceOpen(false)} 
                onSave={handleSaveSource} 
            />
          </div>
      )}

      {/* Add Job Modal Overlay */}
      {isAddJobOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <AddJobForm 
                sources={sources}
                onClose={() => setIsAddJobOpen(false)} 
                onSave={handleSaveJob} 
            />
          </div>
      )}

      {/* Scraper Tester Overlay */}
      {isTesterOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <ScraperTester 
                  source={sources.find(s => s.id === testSourceId)}
                  onClose={() => setIsTesterOpen(false)}
              />
          </div>
      )}
    </div>
  );
};

const CloudTab = () => {
    const [config, setConfig] = useState<CloudConfig>(CloudService.getConfig());
    const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
    const [syncStatus, setSyncStatus] = useState('');

    const handleConnect = async () => {
        setStatus('connecting');
        const success = await CloudService.initialize();
        if (success) {
            setStatus('success');
            // Update local config state with success
            setConfig(prev => ({...prev, isConnected: true}));
        } else {
            setStatus('error');
        }
    };

    const handleSave = () => {
        CloudService.saveConfig(config);
        handleConnect();
    };

    const handleSyncUp = async () => {
        setSyncStatus('Uploading...');
        try {
            const count = await CloudService.syncUp();
            setSyncStatus(`Success! Uploaded ${count} properties to cloud.`);
        } catch (e) {
            setSyncStatus('Error uploading data.');
            console.error(e);
        }
    };

    const handleSyncDown = async () => {
        setSyncStatus('Downloading...');
        try {
            const count = await CloudService.syncDown();
            setSyncStatus(`Success! Downloaded ${count} properties. Reloading...`);
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            setSyncStatus('Error downloading data.');
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h3 className="text-xl font-bold mb-2">Google Cloud / Firebase Connection</h3>
                <p className="text-slate-500">Connect AqarAI to a Firebase Firestore database to persist data and enable real-time updates.</p>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    Configuration 
                    {config.isConnected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Connected</span>}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">API Key</label><input type="password" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900" placeholder="AIza..." /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project ID</label><input type="text" value={config.projectId} onChange={e => setConfig({...config, projectId: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900" placeholder="aqar-ai-xxxx" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Auth Domain</label><input type="text" value={config.authDomain} onChange={e => setConfig({...config, authDomain: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900" placeholder="app.firebaseapp.com" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Storage Bucket</label><input type="text" value={config.storageBucket} onChange={e => setConfig({...config, storageBucket: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900" placeholder="app.appspot.com" /></div>
                    <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">App ID</label><input type="text" value={config.appId} onChange={e => setConfig({...config, appId: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900" placeholder="1:1234..." /></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} disabled={status === 'connecting'} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                        {status === 'connecting' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save & Connect
                    </button>
                    {status === 'error' && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Connection failed</p>}
                </div>
            </div>

            {config.isConnected && (
                <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold mb-4">Data Synchronization</h4>
                    <div className="flex gap-4">
                        <button onClick={handleSyncUp} className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center gap-2 group">
                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                            <span className="font-bold">Sync Up (Upload)</span>
                            <span className="text-xs text-slate-500 text-center">Overwrite Cloud with Local Data</span>
                        </button>
                        <button onClick={handleSyncDown} className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-all flex flex-col items-center gap-2 group">
                            <Download className="w-8 h-8 text-slate-400 group-hover:text-green-500" />
                            <span className="font-bold">Sync Down (Download)</span>
                            <span className="text-xs text-slate-500 text-center">Overwrite Local with Cloud Data</span>
                        </button>
                    </div>
                    {syncStatus && (
                        <div className="mt-4 text-center text-sm font-medium text-blue-600 animate-in fade-in">
                            {syncStatus}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ... Include SremTab, LogsTab, OverviewTab, SourcesTab, ImportTab, ReviewTab, ScraperTester ...
// Re-implementing JobsTab, AddSourceForm, AddJobForm here to ensure file completeness
// (Using exact copies from previous version but ensuring they are inside the file scope)

const JobsTab = ({ jobs, sources, onRun, onAdd, runningJobId }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-bold">Scraping Jobs</h3>
      <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
        <Plus className="w-4 h-4" /> New Job
      </button>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {jobs.length === 0 && <p className="text-slate-500 italic">No jobs configured.</p>}
      {jobs.map((job: any) => {
        const source = sources.find((s: any) => s.id === job.sourceId);
        const isRunning = runningJobId === job.id || job.status === 'running';
        
        return (
            <div key={job.id} className={`bg-white dark:bg-slate-950 p-5 rounded-xl border ${isRunning ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{job.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isRunning ? 'bg-blue-100 text-blue-700 animate-pulse' : job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {isRunning ? 'RUNNING' : job.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">Source: {source?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onRun(job.id, true)}
                            disabled={isRunning}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Dry Run
                        </button>
                        <button 
                            onClick={() => onRun(job.id, false)}
                            disabled={isRunning}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            Run Now
                        </button>
                    </div>
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                    <div>
                        <p className="text-slate-400 uppercase font-bold mb-0.5">Last Run</p>
                        <p className="font-mono">{job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 uppercase font-bold mb-0.5">Extracted</p>
                        <p className="font-mono">{job.metrics.listingsExtracted} items</p>
                    </div>
                    <div>
                        <p className="text-slate-400 uppercase font-bold mb-0.5">Success Rate</p>
                        <p className="font-mono">{job.metrics.successRate}%</p>
                    </div>
                </div>
            </div>
        );
      })}
    </div>
  </div>
);

const AddSourceForm = ({ onClose, onSave }: any) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        baseUrl: '',
        allowedDomains: '',
        robotsRespect: true,
        renderJs: false,
        rateLimitPerMin: 60,
        notes: '',
        selectors: {
            container: '',
            title: '',
            price: '',
            location: '',
            type: '',
            specs: '',
            images: '',
            link: ''
        }
    });

    const handleSelectorChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            selectors: { ...prev.selectors, [key]: value }
        }));
    };

    return (
        <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-lg">Add Enterprise Source</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Step Content */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Source Name</label><input required type="text" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Riyadh Real Estate" /></div>
                            <div><label className="block text-sm font-medium mb-1">Base URL</label><input required type="url" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" value={formData.baseUrl} onChange={e => setFormData({...formData, baseUrl: e.target.value})} placeholder="https://..." /></div>
                            <div><label className="block text-sm font-medium mb-1">Allowed Domains</label><input required type="text" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" value={formData.allowedDomains} onChange={e => setFormData({...formData, allowedDomains: e.target.value})} placeholder="example.com" /></div>
                             <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Rate Limit (req/min)</label><input type="number" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700" value={formData.rateLimitPerMin} onChange={e => setFormData({...formData, rateLimitPerMin: Number(e.target.value)})} /></div>
                                <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={formData.renderJs} onChange={e => setFormData({...formData, renderJs: e.target.checked})} /><span className="text-sm">Render JS (SPA)</span></div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-blue-600">Container</label><input type="text" className="w-full p-2 rounded border border-blue-200 font-mono text-sm" value={formData.selectors.container} onChange={e => handleSelectorChange('container', e.target.value)} placeholder=".property-card" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium">Title</label><input type="text" className="w-full p-2 rounded border font-mono text-sm" value={formData.selectors.title} onChange={e => handleSelectorChange('title', e.target.value)} /></div>
                                <div><label className="block text-sm font-medium">Price</label><input type="text" className="w-full p-2 rounded border font-mono text-sm" value={formData.selectors.price} onChange={e => handleSelectorChange('price', e.target.value)} /></div>
                            </div>
                         </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between">
                    {step === 2 ? <button type="button" onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium">Back</button> : <div></div>}
                    {step === 1 ? <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">Next</button> : <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium">Save Source</button>}
                </div>
            </form>
        </div>
    );
};

const AddJobForm = ({ sources, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        sourceId: sources[0]?.id || '',
        name: '',
        mode: 'list',
        schedule: 'manual'
    });
    return (
        <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Create Job</h3>
            <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Source</label><select className="w-full p-2 rounded border" value={formData.sourceId} onChange={e => setFormData({...formData, sourceId: e.target.value})}>{sources.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" required className="w-full p-2 rounded border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Create</button></div>
            </form>
        </div>
    );
};

const SremTab = () => {
  const [config, setConfig] = useState<SremConfig>(SremService.getConfig());
  const [indicators, setIndicators] = useState<SremIndicator[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { refreshData(); }, []);

  const refreshData = () => {
    setConfig(SremService.getConfig());
    setIndicators(SremService.getIndicators());
  };

  const handleSync = async () => {
    setSyncing(true);
    await SremService.syncNow();
    refreshData();
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">SREM Integration</h3><button onClick={handleSync} disabled={syncing} className="px-4 py-2 bg-blue-600 text-white rounded flex gap-2 items-center">{syncing ? <RefreshCw className="animate-spin w-4 h-4"/> : <Play className="w-4 h-4"/>} Sync Mock Data</button></div>
        {indicators.length > 0 && (
             <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold uppercase text-xs"><tr><th className="px-6 py-3">District</th><th className="px-6 py-3">Avg Price</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{indicators.map(i => <tr key={i.id}><td className="px-6 py-3">{i.district}</td><td className="px-6 py-3">{Math.round(i.avgPriceSqm)} SAR</td></tr>)}</tbody>
                </table>
            </div>
        )}
    </div>
  );
};

const LogsTab = ({ logs }: any) => (
    <div>
        <h3 className="text-lg font-bold mb-4">System Logs</h3>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs h-[400px] overflow-y-auto">
            {logs.map((log: any) => (
                <div key={log.id} className="mb-1 flex gap-3 border-b border-slate-800/50 pb-0.5">
                    <span className="text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`uppercase font-bold w-16 ${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>[{log.level}]</span>
                    <span>{log.message}</span>
                </div>
            ))}
        </div>
    </div>
);

const OverviewTab = ({ sources, jobs, ingested }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200"><p className="text-slate-500 text-sm mb-1">Active Sources</p><p className="text-3xl font-bold">{sources.length}</p></div>
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200"><p className="text-slate-500 text-sm mb-1">Jobs Configured</p><p className="text-3xl font-bold">{jobs.length}</p></div>
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200"><p className="text-slate-500 text-sm mb-1">Pending Review</p><p className="text-3xl font-bold text-amber-500">{ingested.filter((i:any) => i.status === 'draft').length}</p></div>
    </div>
);

const SourcesTab = ({ sources, onAdd, onTest }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between"><h3 className="font-bold">Sources</h3><button onClick={onAdd} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add</button></div>
    {sources.map((s:any) => (
        <div key={s.id} className="bg-white dark:bg-slate-950 p-4 rounded border flex justify-between">
            <div><h4 className="font-bold">{s.name}</h4><p className="text-xs text-slate-500">{s.baseUrl}</p></div>
            <button onClick={() => onTest(s.id)} className="text-blue-600 text-sm">Test</button>
        </div>
    ))}
  </div>
);

const ImportTab = ({ onImport }: any) => {
    const [json, setJson] = useState('');
    const handleImport = async () => {
        try {
            const data = JSON.parse(json);
            if(Array.isArray(data)) {
                const c = await onImport(data);
                alert(`Imported ${c} items`);
            } else alert("Must be array");
        } catch(e) { alert("Invalid JSON"); }
    }
    return (
        <div className="space-y-4">
            <h3 className="font-bold">Import JSON</h3>
            <textarea className="w-full h-40 p-2 border rounded dark:bg-slate-900" placeholder='[{"title": "Villa", "price": 1000000...}]' value={json} onChange={e => setJson(e.target.value)}></textarea>
            <button onClick={handleImport} className="bg-blue-600 text-white px-4 py-2 rounded">Run Import</button>
        </div>
    );
};

const ReviewTab = ({ listings, onApprove, onReject, onApproveAll }: any) => {
    const pending = listings.filter((l:any) => l.status === 'draft' || l.status === 'duplicate');
    return (
        <div className="space-y-4">
            <div className="flex justify-between"><h3 className="font-bold">Review Queue ({pending.length})</h3><button onClick={onApproveAll} className="text-green-600 text-sm font-bold">Approve All</button></div>
            {pending.map((item:any) => (
                <div key={item.id} className="bg-white dark:bg-slate-950 p-4 rounded border flex justify-between items-center">
                    <div>
                        <div className="flex gap-2 mb-1"><span className={`text-[10px] px-1 rounded ${item.status==='duplicate'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{item.status}</span></div>
                        <h4 className="font-bold">{item.extractedData.title}</h4>
                        <p className="text-xs text-slate-500">{item.extractedData.price} SAR - {item.extractedData.district}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onApprove(item.id)} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><Check className="w-4 h-4"/></button>
                        <button onClick={() => onReject(item.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><X className="w-4 h-4"/></button>
                    </div>
                </div>
            ))}
            {pending.length === 0 && <p className="text-slate-400 text-center py-10">No items pending review.</p>}
        </div>
    );
};

const ScraperTester = ({ source, onClose }: any) => (
    <div className="bg-white dark:bg-slate-950 p-6 rounded shadow-xl w-96">
        <h3 className="font-bold mb-2">Test: {source?.name}</h3>
        <p className="text-sm text-slate-500 mb-4">Simulating selector check...</p>
        <button onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2 rounded">Close</button>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${active ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
    <div className="flex items-center gap-3"><Icon className="w-4 h-4" /><span>{label}</span></div>
    {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">{count}</span>}
  </button>
);

export default DataControlModal;
