import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Layers,
  Network,
  Terminal,
  Shield,
  Server,
  Cpu,
  Wifi,
  Printer,
  Camera,
  Smartphone,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NetworkNode, NetworkLink, PingSweepResult, TerminalTheme } from '../types';

interface NetworkTopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PingSweepResult | null;
  onConnectNode?: (node: NetworkNode) => void;
  theme?: TerminalTheme;
}

interface D3Node extends d3.SimulationNodeDatum, NetworkNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node | string;
  target: D3Node | string;
  bandwidth?: string;
  latency?: string;
  linkType?: 'ethernet' | 'fiber' | 'wifi' | 'uplink';
}

export const NetworkTopologyModal: React.FC<NetworkTopologyModalProps> = ({
  isOpen,
  onClose,
  data,
  onConnectNode,
  theme = 'green',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Color theme helpers for retro CRT phosphor aesthetic
  const getThemeColors = () => {
    switch (theme) {
      case 'amber':
        return {
          primary: '#ffb000',
          secondary: '#ffcf66',
          dim: '#aa7500',
          glow: 'rgba(255, 176, 0, 0.4)',
          bg: '#0d0801',
          textClass: 'text-amber-400',
          borderClass: 'border-amber-500/50',
          badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
        };
      case 'cyan':
        return {
          primary: '#00f0ff',
          secondary: '#66f5ff',
          dim: '#008899',
          glow: 'rgba(0, 240, 255, 0.4)',
          bg: '#010c10',
          textClass: 'text-cyan-400',
          borderClass: 'border-cyan-500/50',
          badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
        };
      case 'magenta':
        return {
          primary: '#ff0077',
          secondary: '#ff66aa',
          dim: '#990047',
          glow: 'rgba(255, 0, 119, 0.4)',
          bg: '#0f0108',
          textClass: 'text-pink-400',
          borderClass: 'border-pink-500/50',
          badgeClass: 'bg-pink-950/60 text-pink-300 border-pink-500/40',
        };
      case 'red':
        return {
          primary: '#ff2a3b',
          secondary: '#ff6b78',
          dim: '#a8101e',
          glow: 'rgba(255, 42, 59, 0.4)',
          bg: '#0d0103',
          textClass: 'text-red-400',
          borderClass: 'border-red-500/50',
          badgeClass: 'bg-red-950/60 text-red-300 border-red-500/40',
        };
      case 'white':
        return {
          primary: '#f0f4f8',
          secondary: '#ffffff',
          dim: '#94a3b8',
          glow: 'rgba(240, 244, 248, 0.4)',
          bg: '#07090c',
          textClass: 'text-slate-100',
          borderClass: 'border-slate-400/50',
          badgeClass: 'bg-slate-900/60 text-slate-200 border-slate-500/40',
        };
      case 'green':
      default:
        return {
          primary: '#00ff66',
          secondary: '#66ff99',
          dim: '#008f39',
          glow: 'rgba(0, 255, 102, 0.4)',
          bg: '#030a05',
          textClass: 'text-emerald-400',
          borderClass: 'border-emerald-500/50',
          badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const themeColors = getThemeColors();

  // Helper to color node types
  const getNodeColor = (type: NetworkNode['type']) => {
    switch (type) {
      case 'gateway':
        return '#f59e0b'; // Amber / gold gateway
      case 'switch':
        return '#06b6d4'; // Cyan core switch
      case 'server':
        return '#10b981'; // Green servers
      case 'ap':
        return '#8b5cf6'; // Purple APs
      case 'printer':
        return '#ec4899'; // Pink printer
      case 'camera':
        return '#ef4444'; // Red camera
      case 'client':
      default:
        return '#3b82f6'; // Blue clients
    }
  };

  // Helper to map icon per type
  const renderTypeIcon = (type: NetworkNode['type'], className = 'w-4 h-4') => {
    switch (type) {
      case 'gateway':
        return <Shield className={className} />;
      case 'switch':
        return <Layers className={className} />;
      case 'server':
        return <Server className={className} />;
      case 'ap':
        return <Wifi className={className} />;
      case 'printer':
        return <Printer className={className} />;
      case 'camera':
        return <Camera className={className} />;
      case 'client':
      default:
        return <Cpu className={className} />;
    }
  };

  // D3 FORCE SIMULATION RENDER ENGINE
  useEffect(() => {
    if (!isOpen || !svgRef.current || !data || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'overflow-hidden cursor-grab active:cursor-grabbing');

    // Create defs for filters, glows, and markers
    const defs = svg.append('defs');

    // Phosphor Glow Filter
    const filter = defs.append('filter').attr('id', 'crt-node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', 3.5).attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial gradient for radar background
    const bgRadGrad = defs.append('radialGradient').attr('id', 'radar-grid-glow').attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    bgRadGrad.append('stop').attr('offset', '0%').attr('stop-color', themeColors.glow).attr('stop-opacity', '0.12');
    bgRadGrad.append('stop').attr('offset', '70%').attr('stop-color', themeColors.glow).attr('stop-opacity', '0.03');
    bgRadGrad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent').attr('stop-opacity', '0');

    // Root zoom container
    const g = svg.append('g').attr('class', 'network-graph-group');

    // D3 Zoom & Pan behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Initial centering transform
    svg.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.95).translate(-width / 2, -height / 2)
    );

    // Background Cyber Grid & Radar Rings
    const gridG = g.append('g').attr('class', 'radar-grid');
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height) * 0.7;

    // Draw concentric radar rings
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach((ratio) => {
      gridG
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', maxRadius * ratio)
        .attr('fill', ratio === 0.2 ? 'url(#radar-grid-glow)' : 'none')
        .attr('stroke', themeColors.primary)
        .attr('stroke-width', 0.6)
        .attr('stroke-opacity', 0.15)
        .attr('stroke-dasharray', ratio === 0.6 ? '4,4' : 'none');
    });

    // Radar crosshairs
    gridG
      .append('line')
      .attr('x1', centerX - maxRadius)
      .attr('y1', centerY)
      .attr('x2', centerX + maxRadius)
      .attr('y2', centerY)
      .attr('stroke', themeColors.primary)
      .attr('stroke-width', 0.6)
      .attr('stroke-opacity', 0.12);

    gridG
      .append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - maxRadius)
      .attr('x2', centerX)
      .attr('y2', centerY + maxRadius)
      .attr('stroke', themeColors.primary)
      .attr('stroke-width', 0.6)
      .attr('stroke-opacity', 0.12);

    // Prepare Node & Link deep copies for D3 simulation
    const nodesData: D3Node[] = data.nodes.map((n) => ({ ...n }));
    const linksData: D3Link[] = data.links.map((l) => ({ ...l }));

    // Force simulation setup
    const simulation = d3
      .forceSimulation<D3Node>(nodesData)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(linksData)
          .id((d) => d.id)
          .distance((d) => {
            if (d.linkType === 'uplink') return 120;
            if (d.linkType === 'wifi') return 100;
            return 80;
          })
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-380).distanceMax(500))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<D3Node>().radius((d) => (d.type === 'gateway' || d.type === 'switch' ? 42 : 32)).strength(0.85))
      .force('x', d3.forceX(centerX).strength(0.06))
      .force('y', d3.forceY(centerY).strength(0.06));

    // Links container
    const linkGroup = g.append('g').attr('class', 'links-group');
    const linkLines = linkGroup
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.linkType === 'uplink') return '#f59e0b';
        if (d.linkType === 'fiber') return '#00f0ff';
        if (d.linkType === 'wifi') return '#8b5cf6';
        return '#00ff66';
      })
      .attr('stroke-opacity', (d) => (d.linkType === 'uplink' ? 0.75 : 0.45))
      .attr('stroke-width', (d) => (d.linkType === 'uplink' ? 2.5 : d.linkType === 'fiber' ? 2 : 1.4))
      .attr('stroke-dasharray', (d) => (d.linkType === 'wifi' ? '3,3' : 'none'));

    // Animated packet pulses traveling along links (Visual Data Traffic)
    let packetTimer: any = null;
    if (showTraffic) {
      const packetGroup = g.append('g').attr('class', 'packets-group');
      const packets = packetGroup
        .selectAll('circle')
        .data(linksData)
        .enter()
        .append('circle')
        .attr('r', 2.5)
        .attr('fill', '#ffffff')
        .attr('filter', 'url(#crt-node-glow)')
        .attr('opacity', 0.85);

      let t = 0;
      d3.timer(() => {
        t = (t + 0.007) % 1;
        packets
          .attr('cx', (d: any) => {
            const x1 = d.source.x ?? centerX;
            const x2 = d.target.x ?? centerX;
            return x1 + (x2 - x1) * t;
          })
          .attr('cy', (d: any) => {
            const y1 = d.source.y ?? centerY;
            const y2 = d.target.y ?? centerY;
            return y1 + (y2 - y1) * t;
          });
      });
    }

    // Nodes container
    const nodeGroup = g.append('g').attr('class', 'nodes-group');

    // Drag behavior
    const dragBehavior = d3
      .drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('class', 'node-cursor')
      .style('cursor', 'pointer')
      .call(dragBehavior)
      .on('click', (_event, d) => {
        setSelectedNode(d);
      });

    // Node outer pulsing halo
    nodeElements
      .append('circle')
      .attr('r', (d) => (d.type === 'gateway' ? 24 : d.type === 'switch' ? 21 : 16))
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('fill-opacity', 0.12)
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1)
      .attr('class', 'animate-pulse');

    // Node main core circle
    nodeElements
      .append('circle')
      .attr('r', (d) => (d.type === 'gateway' ? 16 : d.type === 'switch' ? 14 : 11))
      .attr('fill', '#05070a')
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-width', 2)
      .attr('filter', 'url(#crt-node-glow)');

    // Node inner center jewel
    nodeElements
      .append('circle')
      .attr('r', (d) => (d.type === 'gateway' ? 6 : 4))
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('opacity', 0.9);

    // Node IP label & Hostname
    if (showLabels) {
      const labelsGroup = nodeElements.append('g').attr('transform', 'translate(0, 24)');

      // Background rect for readable text
      labelsGroup
        .append('rect')
        .attr('x', (d) => -d.ip.length * 3.6 - 6)
        .attr('y', -3)
        .attr('width', (d) => d.ip.length * 7.2 + 12)
        .attr('height', 15)
        .attr('rx', 3)
        .attr('fill', '#030508')
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#27272a')
        .attr('stroke-width', 0.7);

      // IP text
      labelsGroup
        .append('text')
        .text((d) => d.ip)
        .attr('text-anchor', 'middle')
        .attr('y', 8)
        .attr('font-family', 'var(--term-font, monospace)')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .attr('pointer-events', 'none');

      // Secondary short name label
      labelsGroup
        .append('text')
        .text((d) => {
          const simple = d.name.split('(')[0].trim();
          return simple.length > 16 ? simple.slice(0, 16) + '..' : simple;
        })
        .attr('text-anchor', 'middle')
        .attr('y', 23)
        .attr('font-family', 'var(--term-font, monospace)')
        .attr('font-size', '8.5px')
        .attr('fill', (d) => getNodeColor(d.type))
        .attr('opacity', 0.85)
        .attr('pointer-events', 'none');
    }

    // Simulation tick loop
    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    // Cleanup simulation on unmount/re-render
    return () => {
      simulation.stop();
      if (packetTimer) packetTimer.stop();
    };
  }, [isOpen, data, themeColors, showLabels, showTraffic]);

  if (!isOpen || !data) return null;

  // Filtered nodes for the side list
  const filteredNodes = data.nodes.filter((node) => {
    const matchesType = filterType === 'all' || node.type === filterType;
    const matchesSearch =
      node.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.mac.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topology-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
    >
      <div
        className={`bg-[#030605] border ${themeColors.borderClass} rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-zinc-100 transition-all ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[88vh]'
        }`}
      >
        {/* Header Ribbon */}
        <header className="px-3 sm:px-4 py-2.5 bg-black/80 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-400">
              <Network className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="topology-modal-title" className="text-sm font-bold font-mono tracking-wider text-white">
                  TOPOLOGIA DE REDE D3.JS // SUB-REDE: {data.subnet}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                  {data.activeCount} ATIVOS
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-zinc-900 border border-zinc-700 text-zinc-400">
                  TEMPO: {data.durationMs}ms
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
                Grafo de nós interativos e conexões ativas calculadas via ICMP Echo Discovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Labels */}
            <button
              type="button"
              onClick={() => setShowLabels((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                showLabels ? 'bg-zinc-800 border-zinc-600 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title="Exibir/Ocultar rótulos dos IPs no mapa"
            >
              RÓTULOS {showLabels ? 'ON' : 'OFF'}
            </button>

            {/* Toggle Traffic Animation */}
            <button
              type="button"
              onClick={() => setShowTraffic((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                showTraffic ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
              title="Exibir/Ocultar fluxo de pacotes luminoso"
            >
              TRÁFEGO {showTraffic ? 'ON' : 'OFF'}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              title={isFullScreen ? 'Sair da tela cheia' : 'Expandir para tela cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 cursor-pointer"
              title="Fechar mapa de topologia (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
          {/* D3 Canvas Viewport */}
          <div ref={containerRef} className="flex-1 relative bg-[#020504] overflow-hidden min-h-[300px]">
            <svg ref={svgRef} className="w-full h-full" />

            {/* Map Legend Overlay */}
            <div className="absolute top-2 left-2 p-2 rounded bg-black/80 border border-zinc-800 text-[10px] font-mono backdrop-blur-md pointer-events-none select-none space-y-1">
              <div className="text-zinc-500 font-bold tracking-wider mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" /> LEGENDA DE DISPOSITIVOS
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Gateway / Roteador de Borda
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Switch Core Distribuição
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Servidor / Storage NAS
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Access Point Wi-Fi 6
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Estações & Terminais
              </div>
            </div>

            {/* Zoom / Info Helper Overlay */}
            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-zinc-500 bg-black/60 px-2 py-0.5 rounded border border-zinc-900 pointer-events-none">
              Zoom: {Math.round(zoomLevel * 100)}% • Arraste nós para reposicionar • Scroll para zoom
            </div>
          </div>

          {/* Right Sidebar: Active Node Details & Filter List */}
          <aside className="w-full lg:w-84 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-black/60 flex flex-col shrink-0 min-h-0">
            {/* Search and Category Filter */}
            <div className="p-2.5 border-b border-zinc-800 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por IP, host ou MAC..."
                  className="w-full pl-7 pr-2 py-1.5 rounded bg-zinc-900/90 border border-zinc-700 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Type Category Chips */}
              <div className="flex items-center gap-1 overflow-x-auto cyber-scrollbar pb-1 text-[10px] font-mono">
                {[
                  { id: 'all', label: 'TODOS' },
                  { id: 'gateway', label: 'GATEWAY' },
                  { id: 'switch', label: 'SWITCH' },
                  { id: 'server', label: 'SERVIDORES' },
                  { id: 'client', label: 'CLIENTES' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`px-2 py-0.5 rounded border shrink-0 transition-colors ${
                      filterType === item.id
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Node Inspector or Node List */}
            <div className="flex-1 overflow-y-auto cyber-scrollbar p-2.5 space-y-2.5">
              {selectedNode ? (
                /* Node Inspector Card */
                <div className="rounded border border-cyan-500/40 bg-zinc-950/80 p-3 space-y-3 font-mono">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                        {renderTypeIcon(selectedNode.type, 'w-4 h-4')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {selectedNode.ip}
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{selectedNode.type}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNode(null)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">NOME / HARDWARE:</span>
                      <span className="text-zinc-200 font-medium">{selectedNode.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">LATÊNCIA ICMP:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.rtt}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">MAC ADDRESS:</span>
                        <span className="text-zinc-300 text-[10px]">{selectedNode.mac}</span>
                      </div>
                    </div>

                    {selectedNode.role && (
                      <div className="pt-1">
                        <span className="text-zinc-500 block text-[10px]">FUNÇÃO NA REDE:</span>
                        <span className="text-cyan-300 text-[10px]">{selectedNode.role}</span>
                      </div>
                    )}

                    {selectedNode.services && selectedNode.services.length > 0 && (
                      <div className="pt-1">
                        <span className="text-zinc-500 block text-[10px] mb-1">SERVIÇOS DETECTADOS:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.services.map((svc) => (
                            <span
                              key={svc}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-black/60 border border-zinc-800 text-zinc-300"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedNode.ports && selectedNode.ports.length > 0 && (
                      <div className="pt-1">
                        <span className="text-zinc-500 block text-[10px] mb-1">PORTAS DISPONÍVEIS:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.ports.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold"
                            >
                              {p}/tcp
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for this selected node */}
                  {onConnectNode && (
                    <div className="pt-2 border-t border-zinc-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onConnectNode(selectedNode);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>CONECTAR TERMINAL</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Filtered list of nodes */
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>DISPOSITIVOS ({filteredNodes.length})</span>
                    <span className="text-[9px]">CLIQUE P/ DETALHES</span>
                  </div>

                  {filteredNodes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      className="w-full text-left p-2 rounded bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 font-mono transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getNodeColor(n.type) }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 truncate">
                            {n.ip}
                          </div>
                          <div className="text-[9px] text-zinc-500 truncate">{n.name}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-emerald-400 font-bold">{n.rtt}</span>
                        <div className="text-[8px] text-zinc-600 uppercase">{n.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-2 border-t border-zinc-800 bg-black/80 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <div>VARREDURA: {data.subnet}</div>
              <div className="text-emerald-400 font-bold">{data.nodes.length} NÓS MAPEADOS</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
