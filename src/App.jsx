import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Plus, Trash2 } from 'lucide-react';

const VirtualMemoryManager = () => {
  const [mode, setMode] = useState('paging');
  const [algorithm, setAlgorithm] = useState('fifo');
  const [pageFrames, setPageFrames] = useState(3);
  const [pageSequence, setPageSequence] = useState([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frames, setFrames] = useState([]);
  const [pageFaults, setPageFaults] = useState(0);
  const [pageHits, setPageHits] = useState(0);
  const [history, setHistory] = useState([]);
  const [segments, setSegments] = useState([
    { id: 0, name: 'Code', base: 0, limit: 1000, color: '#3b82f6' },
    { id: 1, name: 'Data', base: 1000, limit: 2000, color: '#10b981' },
    { id: 2, name: 'Stack', base: 3000, limit: 1000, color: '#f59e0b' },
    { id: 3, name: 'Heap', base: 4000, limit: 2000, color: '#8b5cf6' }
  ]);
  const [accessAddress, setAccessAddress] = useState(1500);

  useEffect(() => {
    resetSimulation();
  }, [algorithm, pageFrames, mode]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < pageSequence.length) {
      interval = setInterval(() => {
        processNextPage();
      }, 1000);
    } else if (currentStep >= pageSequence.length) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const resetSimulation = () => {
    setFrames(Array(pageFrames).fill(null));
    setPageFaults(0);
    setPageHits(0);
    setCurrentStep(0);
    setHistory([]);
    setIsPlaying(false);
  };

  const processNextPage = () => {
    if (currentStep >= pageSequence.length) return;

    const page = pageSequence[currentStep];
    let newFrames = [...frames];
    let fault = false;
    let hit = false;

    if (newFrames.includes(page)) {
      hit = true;
      setPageHits(prev => prev + 1);
    } else {
      fault = true;
      setPageFaults(prev => prev + 1);

      if (newFrames.includes(null)) {
        const emptyIndex = newFrames.indexOf(null);
        newFrames[emptyIndex] = page;
      } else {
        const victimIndex = selectVictim(newFrames, page);
        newFrames[victimIndex] = page;
      }
    }

    setFrames(newFrames);
    setHistory(prev => [...prev, { 
      step: currentStep, 
      page, 
      frames: [...newFrames], 
      fault,
      hit 
    }]);
    setCurrentStep(prev => prev + 1);
  };

  const selectVictim = (currentFrames, newPage) => {
    if (algorithm === 'fifo') {
      return currentStep % pageFrames;
    } else if (algorithm === 'lru') {
      const lastUsed = currentFrames.map(frame => {
        for (let i = currentStep - 1; i >= 0; i--) {
          if (pageSequence[i] === frame) return i;
        }
        return -1;
      });
      return lastUsed.indexOf(Math.min(...lastUsed));
    } else if (algorithm === 'optimal') {
      const nextUse = currentFrames.map(frame => {
        for (let i = currentStep + 1; i < pageSequence.length; i++) {
          if (pageSequence[i] === frame) return i;
        }
        return Infinity;
      });
      return nextUse.indexOf(Math.max(...nextUse));
    }
    return 0;
  };

  const addPageToSequence = () => {
    const newPage = Math.floor(Math.random() * 6) + 1;
    setPageSequence([...pageSequence, newPage]);
  };

  const findSegment = (address) => {
    return segments.find(seg => address >= seg.base && address < seg.base + seg.limit);
  };

  const hitRate = pageHits + pageFaults > 0 
    ? ((pageHits / (pageHits + pageFaults)) * 100).toFixed(1)
    : 0;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Virtual Memory Manager
        </h1>
        <p className="text-gray-400 text-center mb-6">Visualize paging, segmentation, and replacement algorithms</p>

        {/* Mode Selection */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setMode('paging')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'paging' 
                ? 'bg-blue-600 shadow-lg shadow-blue-500/50' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Paging
          </button>
          <button
            onClick={() => setMode('segmentation')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'segmentation' 
                ? 'bg-purple-600 shadow-lg shadow-purple-500/50' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Segmentation
          </button>
        </div>

        {mode === 'paging' ? (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Replacement Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="fifo">FIFO (First In First Out)</option>
                    <option value="lru">LRU (Least Recently Used)</option>
                    <option value="optimal">Optimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Page Frames: {pageFrames}</label>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={pageFrames}
                    onChange={(e) => setPageFrames(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Page Sequence</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pageSequence.join(', ')}
                      onChange={(e) => {
                        const nums = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                        setPageSequence(nums);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={addPageToSequence}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={currentStep >= pageSequence.length}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Play size={20} />
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={processNextPage}
                  disabled={currentStep >= pageSequence.length}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Step
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 shadow-xl">
                <div className="text-3xl font-bold mb-1">{pageFaults}</div>
                <div className="text-red-200">Page Faults</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
                <div className="text-3xl font-bold mb-1">{pageHits}</div>
                <div className="text-green-200">Page Hits</div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
                <div className="text-3xl font-bold mb-1">{hitRate}%</div>
                <div className="text-blue-200">Hit Rate</div>
              </div>
            </div>

            {/* Current Frames */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Physical Memory Frames</h3>
              <div className="grid grid-cols-5 gap-4">
                {frames.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`h-24 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                      frame !== null
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                        : 'bg-gray-700 border-2 border-dashed border-gray-600'
                    }`}
                  >
                    {frame !== null ? `Page ${frame}` : 'Empty'}
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Execution History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left">Step</th>
                      <th className="px-4 py-2 text-left">Page</th>
                      <th className="px-4 py-2 text-left">Result</th>
                      <th className="px-4 py-2 text-left">Frames State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="px-4 py-2">{record.step + 1}</td>
                        <td className="px-4 py-2 font-mono">{record.page}</td>
                        <td className="px-4 py-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            record.hit 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          }`}>
                            {record.hit ? 'HIT' : 'FAULT'}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono">
                          [{record.frames.map(f => f !== null ? f : '-').join(', ')}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Segmentation Visualization */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Memory Segments</h3>
              <div className="space-y-3">
                {segments.map(seg => (
                  <div key={seg.id} className="flex items-center gap-4">
                    <div
                      className="flex-1 h-16 rounded-lg flex items-center px-6 text-white font-semibold shadow-lg"
                      style={{ backgroundColor: seg.color }}
                    >
                      <div className="flex-1">
                        <div className="text-lg">{seg.name}</div>
                        <div className="text-sm opacity-80">
                          Base: {seg.base} | Limit: {seg.limit} | End: {seg.base + seg.limit}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Translation */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Address Translation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Logical Address</label>
                  <input
                    type="number"
                    value={accessAddress}
                    onChange={(e) => setAccessAddress(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {(() => {
                  const seg = findSegment(accessAddress);
                  return seg ? (
                    <div className="p-4 rounded-lg" style={{ backgroundColor: seg.color + '20', borderLeft: `4px solid ${seg.color}` }}>
                      <div className="text-lg font-semibold mb-2">✓ Valid Access</div>
                      <div className="space-y-1 text-sm">
                        <div>Segment: <span className="font-mono font-bold">{seg.name}</span></div>
                        <div>Physical Address: <span className="font-mono font-bold">{accessAddress}</span></div>
                        <div>Offset within segment: <span className="font-mono font-bold">{accessAddress - seg.base}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-900/30 rounded-lg border-l-4 border-red-600">
                      <div className="text-lg font-semibold mb-2">✗ Segmentation Fault</div>
                      <div className="text-sm">Address {accessAddress} is not within any valid segment</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Visual Memory Map */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Memory Map</h3>
              <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
                {segments.map(seg => {
                  const totalMemory = 6000;
                  const top = (seg.base / totalMemory) * 100;
                  const height = (seg.limit / totalMemory) * 100;
                  return (
                    <div
                      key={seg.id}
                      className="absolute w-full transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        backgroundColor: seg.color
                      }}
                    >
                      <div className="p-3 text-white text-sm font-semibold">
                        {seg.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualMemoryManager;