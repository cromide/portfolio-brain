// ===== Portfolio Brain — Neuron Graph Visualization =====
// "Blank Neuron" Model: 채워진 뉴런 vs 비어있는 뉴런

(async function () {
  const data = await fetch('./data/graph.json').then(r => r.json());

  // ===== Neuron State Classification =====
  // fired: 이미 습득/완료 (활성 뉴런)
  // sparking: 현재 학습 중 (점화 중)
  // blank: 아직 비어있음 (미래/리스크 해결 필요)
  // phase: 로드맵 단계
  // risk: 해결해야 할 문제

  function neuronState(d) {
    if (d.type === 'core' || d.type === 'domain') return 'fired';
    if (d.type === 'risk') return 'risk';
    if (d.type === 'phase') return 'phase';
    if (d.type === 'future') return 'blank';
    if (d.status === 'learning') return 'sparking';
    if (d.status === 'acquired' || d.status === 'completed') return 'fired';
    return 'blank';
  }

  // ===== Color Map =====
  const COLOR = {
    core: '#ffffff',
    design: '#f472b6',
    dev: '#60a5fa',
    publishing: '#34d399',
    planning: '#fbbf24',
  };

  function nodeColor(d) {
    if (d.type === 'core') return COLOR.core;
    if (d.type === 'risk') {
      if (d.status === 'critical') return '#ef4444';
      if (d.status === 'high') return '#f97316';
      return '#eab308';
    }
    if (d.type === 'phase') return '#22d3ee';
    if (d.type === 'future') return '#a78bfa';
    if (d.status === 'learning') return '#f59e0b';
    return COLOR[d.group] || '#888';
  }

  // ===== Fill intensity based on neuron state =====
  function neuronFill(d) {
    const state = neuronState(d);
    const c = nodeColor(d);

    if (d.type === 'core') return 'rgba(255,255,255,0.2)';

    switch (state) {
      case 'fired': {
        // 채워진 뉴런 — 선명한 내부 빛
        const c2 = COLOR[d.group] || '#888';
        if (d.type === 'domain') return c2 + '30';
        if (d.type === 'project') return c2 + '35';
        return c2 + '28';
      }
      case 'sparking':
        // 점화 중 — 깜빡이는 호박색 내부
        return 'rgba(245, 158, 11, 0.08)';
      case 'blank':
        // 빈 뉴런 — 거의 투명, 점선 윤곽만
        return 'rgba(167, 139, 250, 0.03)';
      case 'risk':
        if (d.status === 'critical') return 'rgba(239, 68, 68, 0.12)';
        if (d.status === 'high') return 'rgba(249, 115, 22, 0.08)';
        return 'rgba(234, 179, 8, 0.06)';
      case 'phase':
        return 'rgba(34, 211, 238, 0.06)';
      default:
        return 'rgba(255,255,255,0.03)';
    }
  }

  function neuronStrokeWidth(d) {
    const state = neuronState(d);
    if (d.type === 'core') return 3;
    if (d.type === 'domain') return 2.5;
    if (state === 'fired') return 2;
    if (state === 'sparking') return 1.5;
    if (state === 'blank') return 1;
    if (state === 'risk') return 2;
    if (state === 'phase') return 2;
    return 1;
  }

  function neuronStrokeDash(d) {
    const state = neuronState(d);
    if (state === 'blank') return '3 4';
    if (state === 'sparking') return '6 2';
    return 'none';
  }

  function neuronStrokeOpacity(d) {
    const state = neuronState(d);
    if (d.type === 'core') return 1;
    if (state === 'fired') return 0.9;
    if (state === 'sparking') return 0.7;
    if (state === 'blank') return 0.25;
    if (state === 'risk') return 0.8;
    if (state === 'phase') return 0.7;
    return 0.3;
  }

  // ===== SVG Setup =====
  const container = document.getElementById('graph-container');
  const svg = d3.select('#graph');
  const width = container.clientWidth;
  const height = container.clientHeight;

  svg.attr('viewBox', [0, 0, width, height]);

  const defs = svg.append('defs');

  // Glow filters
  const glowFilter = defs.append('filter').attr('id', 'glow');
  glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
  glowFilter.append('feMerge').selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

  const coreGlow = defs.append('filter').attr('id', 'core-glow');
  coreGlow.append('feGaussianBlur').attr('stdDeviation', '8').attr('result', 'blur');
  coreGlow.append('feMerge').selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

  // Soft blank glow
  const blankGlow = defs.append('filter').attr('id', 'blank-glow');
  blankGlow.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
  blankGlow.append('feMerge').selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

  // Risk pulse filter
  const riskGlow = defs.append('filter').attr('id', 'risk-glow');
  riskGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
  riskGlow.append('feMerge').selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

  // Background particles
  const bgGroup = svg.append('g').attr('class', 'bg-particles');
  for (let i = 0; i < 80; i++) {
    bgGroup.append('circle')
      .attr('cx', Math.random() * width)
      .attr('cy', Math.random() * height)
      .attr('r', Math.random() * 1.2 + 0.2)
      .attr('fill', 'rgba(255,255,255,0.06)')
      .style('animation', `pulse ${3 + Math.random() * 5}s ease-in-out infinite`)
      .style('animation-delay', `${Math.random() * 4}s`);
  }

  const g = svg.append('g');

  // ===== Zoom =====
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', (e) => {
      g.attr('transform', e.transform);
      updateMinimap();
    });
  svg.call(zoom);

  // ===== Force Simulation =====
  const nodes = data.nodes.map(d => ({ ...d, state: neuronState(d) }));
  const edges = data.edges.map(d => ({ ...d }));

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id(d => d.id).distance(d => {
      if (d.type === 'domain') return 180;
      if (d.type === 'has_skill') return 110;
      if (d.type === 'used_in') return 85;
      if (d.type === 'cross_domain') return 200;
      if (d.type === 'leads_to') return 100;
      if (d.type === 'resolves') return 75;
      if (d.type === 'solves') return 65;
      if (d.type === 'sequence') return 90;
      return 130;
    }).strength(d => {
      if (d.type === 'domain') return 0.5;
      if (d.type === 'cross_domain') return 0.08;
      if (d.type === 'sequence') return 0.6;
      if (d.type === 'resolves' || d.type === 'solves') return 0.15;
      return 0.25;
    }))
    .force('charge', d3.forceManyBody().strength(d => {
      if (d.type === 'core') return -800;
      if (d.type === 'domain') return -500;
      if (d.type === 'phase') return -300;
      if (d.type === 'risk') return -250;
      return -120;
    }))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.size + 10))
    .force('x', d3.forceX(width / 2).strength(0.02))
    .force('y', d3.forceY(height / 2).strength(0.02));

  // ===== Draw Edges =====
  const linkGroup = g.append('g').attr('class', 'links');

  const link = linkGroup.selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', d => {
      if (d.type === 'leads_to') return '#a78bfa';
      if (d.type === 'cross_domain') return 'rgba(255,255,255,0.06)';
      if (d.type === 'used_in') return 'rgba(255,255,255,0.08)';
      if (d.type === 'resolves') return 'rgba(239, 68, 68, 0.25)';
      if (d.type === 'solves') return 'rgba(34, 211, 238, 0.35)';
      if (d.type === 'sequence') return '#22d3ee';
      if (d.type === 'domain') return 'rgba(255,255,255,0.2)';
      return 'rgba(255,255,255,0.1)';
    })
    .attr('stroke-width', d => {
      if (d.type === 'domain') return 2;
      if (d.type === 'sequence') return 3;
      if (d.type === 'cross_domain') return 0.8;
      return 1;
    })
    .attr('stroke-dasharray', d => {
      if (d.type === 'used_in') return '4 3';
      if (d.type === 'leads_to') return '2 4';
      if (d.type === 'cross_domain') return '6 4';
      if (d.type === 'resolves') return '3 3';
      if (d.type === 'solves') return '6 3';
      return 'none';
    })
    .style('opacity', 0.6);

  // ===== Draw Nodes =====
  const nodeGroup = g.append('g').attr('class', 'nodes');

  const node = nodeGroup.selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', d => `node node-${d.type} neuron-${d.state}`)
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragStart)
      .on('drag', dragging)
      .on('end', dragEnd));

  // === Outer glow ring ===
  node.append('circle')
    .attr('class', 'glow-ring')
    .attr('r', d => d.size + 8)
    .attr('fill', 'none')
    .attr('stroke', d => nodeColor(d))
    .attr('stroke-width', d => d.state === 'blank' ? 1 : 2)
    .attr('stroke-opacity', d => {
      if (d.type === 'core') return 0.6;
      if (d.state === 'fired') return 0.25;
      if (d.state === 'sparking') return 0.2;
      if (d.state === 'blank') return 0.08;
      if (d.state === 'risk') return 0.4;
      return 0.15;
    })
    .attr('stroke-dasharray', d => d.state === 'blank' ? '2 6' : 'none')
    .style('animation', d => {
      if (d.type === 'core') return 'pulse 2.5s ease-in-out infinite';
      if (d.state === 'risk' && d.status === 'critical') return 'pulse 1.5s ease-in-out infinite';
      if (d.state === 'blank') return 'pulse 4s ease-in-out infinite';
      if (d.state === 'sparking') return 'pulse 2s ease-in-out infinite';
      return 'none';
    });

  // === Inner fill pattern for blank neurons ===
  // Blank neurons get a subtle cross-hatch / empty feel
  node.filter(d => d.state === 'blank')
    .append('circle')
    .attr('class', 'blank-inner')
    .attr('r', d => d.size * 0.4)
    .attr('fill', 'none')
    .attr('stroke', d => nodeColor(d))
    .attr('stroke-width', 0.5)
    .attr('stroke-opacity', 0.15)
    .attr('stroke-dasharray', '1 3');

  // === Main circle ===
  node.append('circle')
    .attr('class', 'main-circle')
    .attr('r', d => d.size)
    .attr('fill', d => neuronFill(d))
    .attr('stroke', d => nodeColor(d))
    .attr('stroke-width', d => neuronStrokeWidth(d))
    .attr('stroke-dasharray', d => neuronStrokeDash(d))
    .attr('stroke-opacity', d => neuronStrokeOpacity(d))
    .attr('filter', d => {
      if (d.type === 'core') return 'url(#core-glow)';
      if (d.state === 'blank') return 'url(#blank-glow)';
      if (d.state === 'risk') return 'url(#risk-glow)';
      return 'url(#glow)';
    });

  // === Fired neurons: solid inner core ===
  node.filter(d => d.state === 'fired' && d.type !== 'domain')
    .append('circle')
    .attr('class', 'fired-core')
    .attr('r', d => d.size * 0.35)
    .attr('fill', d => nodeColor(d))
    .attr('opacity', 0.25);

  // === Core neuron: bright center ===
  node.filter(d => d.type === 'core')
    .append('circle')
    .attr('r', 10)
    .attr('fill', '#ffffff')
    .attr('filter', 'url(#core-glow)')
    .style('animation', 'pulse 3s ease-in-out infinite');

  // === Sparking neurons: flickering inner ring ===
  node.filter(d => d.state === 'sparking')
    .append('circle')
    .attr('class', 'spark-ring')
    .attr('r', d => d.size * 0.6)
    .attr('fill', 'none')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '3 5')
    .attr('stroke-opacity', 0.4)
    .style('animation', 'pulse 1.8s ease-in-out infinite');

  // === Blank neurons: "?" or empty indicator ===
  node.filter(d => d.state === 'blank')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', d => nodeColor(d))
    .attr('font-size', d => Math.max(10, d.size * 0.6) + 'px')
    .attr('font-weight', '300')
    .attr('opacity', 0.2)
    .text('?');

  // === Phase neurons: number indicator ===
  node.filter(d => d.type === 'phase')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', '#22d3ee')
    .attr('font-size', d => Math.max(11, d.size * 0.5) + 'px')
    .attr('font-weight', '700')
    .attr('opacity', 0.6)
    .text(d => {
      const m = d.label.match(/P(\d)/);
      return m ? m[1] : '';
    });

  // === Risk neurons: "!" indicator ===
  node.filter(d => d.state === 'risk')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', d => nodeColor(d))
    .attr('font-size', d => Math.max(12, d.size * 0.7) + 'px')
    .attr('font-weight', '700')
    .attr('opacity', 0.5)
    .text('!');

  // === Status badge dot ===
  node.filter(d => d.state === 'sparking' || d.state === 'blank' || d.state === 'risk' || d.state === 'phase')
    .append('circle')
    .attr('class', 'status-dot')
    .attr('cx', d => d.size * 0.7)
    .attr('cy', d => -d.size * 0.7)
    .attr('r', 4)
    .attr('fill', d => {
      if (d.status === 'critical') return '#ef4444';
      if (d.status === 'high') return '#f97316';
      if (d.status === 'medium') return '#eab308';
      if (d.type === 'phase') return '#22d3ee';
      if (d.state === 'sparking') return '#f59e0b';
      return '#a78bfa';
    })
    .attr('stroke', '#0a0a0f')
    .attr('stroke-width', 2);

  // === Progress ring for sparking neurons ===
  node.filter(d => d.state === 'sparking')
    .append('circle')
    .attr('r', d => d.size + 3)
    .attr('fill', 'none')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', d => {
      const circ = 2 * Math.PI * (d.size + 3);
      return `${circ * 0.3} ${circ * 0.7}`;
    })
    .attr('stroke-opacity', 0.4)
    .style('animation', 'spin 6s linear infinite');

  // === Labels ===
  node.append('text')
    .attr('class', 'node-label')
    .attr('dy', d => d.size + 18)
    .attr('text-anchor', 'middle')
    .attr('fill', d => {
      if (d.type === 'core') return '#ffffff';
      return nodeColor(d);
    })
    .attr('font-size', d => {
      if (d.type === 'core') return '15px';
      if (d.type === 'domain') return '13px';
      if (d.type === 'phase') return '11px';
      return '11px';
    })
    .attr('font-weight', d => (d.type === 'core' || d.type === 'domain' || d.type === 'phase') ? '700' : '500')
    .attr('opacity', d => {
      if (d.state === 'blank') return 0.35;
      if (d.state === 'sparking') return 0.7;
      if (d.state === 'fired') return 0.9;
      return 0.65;
    })
    .text(d => d.label);

  // ===== Tooltip =====
  const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none');

  node.on('mouseenter', (e, d) => {
    const stateLabel = { fired: 'ACTIVE', sparking: 'LEARNING', blank: 'BLANK', risk: 'RISK', phase: 'ROADMAP' };
    const stateEmoji = { fired: '', sparking: '', blank: '', risk: '', phase: '' };
    tooltip.style('display', 'block')
      .html(`
        <div class="tt-label">${d.label}</div>
        <div class="tt-type">${stateEmoji[d.state] || ''} ${stateLabel[d.state] || d.state} · ${groupLabel(d.group)}</div>
        ${d.state === 'blank' ? '<div class="tt-blank">채워야 할 뉴런</div>' : ''}
        ${d.state === 'sparking' ? '<div class="tt-spark">현재 학습 중</div>' : ''}
      `);
    highlightConnections(d);
  })
    .on('mousemove', (e) => {
      tooltip.style('left', (e.pageX + 14) + 'px').style('top', (e.pageY - 10) + 'px');
    })
    .on('mouseleave', () => {
      tooltip.style('display', 'none');
      resetHighlight();
    })
    .on('click', (e, d) => {
      e.stopPropagation();
      showPanel(d);
    });

  svg.on('click', () => hidePanel());

  // ===== Simulation Tick =====
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // ===== Drag =====
  function dragStart(e, d) {
    if (!e.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragging(e, d) { d.fx = e.x; d.fy = e.y; }
  function dragEnd(e, d) {
    if (!e.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }

  // ===== Highlight =====
  function highlightConnections(d) {
    const connected = new Set();
    connected.add(d.id);
    edges.forEach(e => {
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      if (sid === d.id) connected.add(tid);
      if (tid === d.id) connected.add(sid);
    });

    node.style('opacity', n => connected.has(n.id) ? 1 : 0.08);
    link.style('opacity', e => {
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      return (sid === d.id || tid === d.id) ? 0.9 : 0.02;
    });
  }

  function resetHighlight() {
    node.style('opacity', 1);
    link.style('opacity', 0.6);
  }

  // ===== Panel =====
  const panel = document.getElementById('detail-panel');
  const panelClose = document.getElementById('panel-close');
  panelClose.addEventListener('click', hidePanel);

  function showPanel(d) {
    panel.classList.remove('hidden');

    const badge = document.getElementById('panel-badge');
    const stateLabels = { fired: 'ACTIVE NEURON', sparking: 'SPARKING', blank: 'BLANK NEURON', risk: 'RISK', phase: 'ROADMAP' };
    badge.textContent = stateLabels[d.state] || typeLabel(d.type);
    badge.style.background = nodeColor(d) + '22';
    badge.style.color = nodeColor(d);
    badge.style.border = `1px solid ${nodeColor(d)}44`;

    document.getElementById('panel-title').textContent = d.label;
    document.getElementById('panel-description').textContent = d.description || '';

    // Build meta tags
    const meta = document.getElementById('panel-meta');
    meta.innerHTML = '';
    addMeta(meta, groupLabel(d.group), COLOR[d.group]);
    if (d.year) addMeta(meta, d.year);
    if (d.status) addMeta(meta, statusLabel(d.status));
    if (d.month) addMeta(meta, d.month);
    if (d.phase) addMeta(meta, `Phase ${d.phase}`);

    // Growth hint for blank neurons
    const growthHint = document.getElementById('panel-growth');
    if (growthHint) growthHint.remove();
    if (d.state === 'blank' || d.state === 'sparking') {
      const hint = document.createElement('div');
      hint.id = 'panel-growth';
      hint.className = 'growth-hint';
      hint.innerHTML = d.state === 'blank'
        ? '<strong>Growth Path:</strong> 이 뉴런을 활성화하면 연결된 네트워크가 강화됩니다.'
        : '<strong>In Progress:</strong> 이 뉴런을 완전히 활성화하기 위해 학습 중입니다.';
      panel.insertBefore(hint, document.getElementById('panel-connections'));
    }

    // Connections
    const linksList = document.getElementById('panel-links');
    linksList.innerHTML = '';
    const connected = [];
    edges.forEach(e => {
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      if (sid === d.id) {
        const target = nodes.find(n => n.id === tid);
        if (target) connected.push(target);
      }
      if (tid === d.id) {
        const source = nodes.find(n => n.id === sid);
        if (source) connected.push(source);
      }
    });

    // Deduplicate and sort: fired first, then sparking, then blank
    const seen = new Set();
    const unique = connected.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    const order = { fired: 0, sparking: 1, phase: 2, risk: 3, blank: 4 };
    unique.sort((a, b) => (order[a.state] || 9) - (order[b.state] || 9));

    unique.forEach(c => {
      const li = document.createElement('li');
      const stateIcon = c.state === 'blank' ? ' [blank]' : c.state === 'sparking' ? ' [learning]' : '';
      li.innerHTML = `<span class="link-dot" style="background:${nodeColor(c)};${c.state === 'blank' ? 'opacity:0.3;border:1px dashed ' + nodeColor(c) + ';background:transparent;' : ''}"></span>${c.label}${stateIcon}`;
      li.addEventListener('click', () => { showPanel(c); zoomToNode(c); });
      linksList.appendChild(li);
    });

    zoomToNode(d);
  }

  function hidePanel() { panel.classList.add('hidden'); }

  function addMeta(container, text, color) {
    const span = document.createElement('span');
    span.className = 'meta-tag';
    span.textContent = text;
    if (color) {
      span.style.borderColor = color + '44';
      span.style.color = color;
    }
    container.appendChild(span);
  }

  function zoomToNode(d) {
    svg.transition().duration(600)
      .call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1.5)
        .translate(-d.x, -d.y));
  }

  // ===== Filters =====
  let activeFilter = 'all';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  function applyFilter() {
    if (activeFilter === 'all') {
      node.style('opacity', 1).style('pointer-events', 'all');
      link.style('opacity', 0.6);
      return;
    }

    const groupFilters = ['design', 'dev', 'publishing', 'planning'];
    const stateFilters = ['fired', 'sparking', 'blank'];
    const typeFilters = ['risk', 'phase'];

    const isGroup = groupFilters.includes(activeFilter);
    const isState = stateFilters.includes(activeFilter);
    const isType = typeFilters.includes(activeFilter);

    node.style('opacity', d => {
      if (d.type === 'core') return 1;
      if (isGroup) return d.group === activeFilter ? 1 : 0.06;
      if (isState) return d.state === activeFilter ? 1 : 0.06;
      if (isType) return d.type === activeFilter ? 1 : 0.06;
      return 0.06;
    }).style('pointer-events', d => {
      if (d.type === 'core') return 'all';
      if (isGroup) return d.group === activeFilter ? 'all' : 'none';
      if (isState) return d.state === activeFilter ? 'all' : 'none';
      if (isType) return d.type === activeFilter ? 'all' : 'none';
      return 'none';
    });

    link.style('opacity', e => {
      const s = typeof e.source === 'object' ? e.source : null;
      const t = typeof e.target === 'object' ? e.target : null;
      if (!s || !t) return 0.02;
      if (isGroup) return (s.group === activeFilter || t.group === activeFilter) ? 0.5 : 0.02;
      if (isState) return (s.state === activeFilter || t.state === activeFilter) ? 0.5 : 0.02;
      if (isType) return (s.type === activeFilter || t.type === activeFilter) ? 0.5 : 0.02;
      return 0.02;
    });
  }

  // ===== Search =====
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) { applyFilter(); return; }

    const matches = new Set();
    nodes.forEach(n => {
      if (n.label.toLowerCase().includes(q) || (n.description && n.description.toLowerCase().includes(q)))
        matches.add(n.id);
    });

    node.style('opacity', d => matches.has(d.id) ? 1 : 0.04);
    link.style('opacity', 0.02);

    if (matches.size === 1) {
      const target = nodes.find(n => matches.has(n.id));
      if (target) zoomToNode(target);
    }
  });

  // ===== Minimap =====
  const minimapCanvas = document.getElementById('minimap-canvas');
  const mCtx = minimapCanvas.getContext('2d');

  function updateMinimap() {
    const mw = minimapCanvas.width;
    const mh = minimapCanvas.height;
    mCtx.clearRect(0, 0, mw, mh);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const pad = 50;
    const rangeX = (maxX - minX) + pad * 2 || 1;
    const rangeY = (maxY - minY) + pad * 2 || 1;
    const scale = Math.min(mw / rangeX, mh / rangeY);
    const offsetX = (mw - rangeX * scale) / 2;
    const offsetY = (mh - rangeY * scale) / 2;

    function mx(x) { return (x - minX + pad) * scale + offsetX; }
    function my(y) { return (y - minY + pad) * scale + offsetY; }

    // Edges
    mCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    mCtx.lineWidth = 0.5;
    edges.forEach(e => {
      const s = typeof e.source === 'object' ? e.source : null;
      const t = typeof e.target === 'object' ? e.target : null;
      if (!s || !t) return;
      mCtx.beginPath(); mCtx.moveTo(mx(s.x), my(s.y)); mCtx.lineTo(mx(t.x), my(t.y)); mCtx.stroke();
    });

    // Nodes
    nodes.forEach(n => {
      mCtx.beginPath();
      mCtx.arc(mx(n.x), my(n.y), Math.max(1.5, n.size * scale * 0.3), 0, Math.PI * 2);
      mCtx.fillStyle = nodeColor(n);
      mCtx.globalAlpha = n.state === 'blank' ? 0.15 : n.type === 'core' ? 1 : 0.5;
      mCtx.fill();
      // Blank nodes: ring only
      if (n.state === 'blank') {
        mCtx.globalAlpha = 0.3;
        mCtx.strokeStyle = nodeColor(n);
        mCtx.lineWidth = 0.5;
        mCtx.stroke();
      }
    });
    mCtx.globalAlpha = 1;

    // Viewport
    const t = d3.zoomTransform(svg.node());
    mCtx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
    mCtx.lineWidth = 1;
    mCtx.strokeRect(mx((-t.x) / t.k), my((-t.y) / t.k), (width / t.k) * scale, (height / t.k) * scale);
  }

  simulation.on('tick.minimap', updateMinimap);

  // ===== Stats =====
  const statsEl = document.getElementById('stats');
  const firedCount = nodes.filter(n => n.state === 'fired' && n.type !== 'core' && n.type !== 'domain').length;
  const sparkCount = nodes.filter(n => n.state === 'sparking').length;
  const blankCount = nodes.filter(n => n.state === 'blank').length;
  const riskCount = nodes.filter(n => n.state === 'risk').length;
  const totalNeurons = firedCount + sparkCount + blankCount;
  const pct = Math.round((firedCount / totalNeurons) * 100);
  statsEl.innerHTML = `<span style="color:#34d399">ACTIVE ${firedCount}</span> · <span style="color:#f59e0b">SPARKING ${sparkCount}</span> · <span style="color:#a78bfa">BLANK ${blankCount}</span> · <span style="color:#ef4444">RISK ${riskCount}</span> &nbsp;|&nbsp; Brain: <strong>${pct}%</strong> activated`;

  // ===== Helpers =====
  function typeLabel(type) {
    return { core: 'Core', domain: 'Domain', skill: 'Skill', project: 'Project', future: 'Future', risk: 'Risk', phase: 'Roadmap' }[type] || type;
  }
  function groupLabel(group) {
    return { core: 'Core', design: 'Design', dev: 'Dev', publishing: 'Publishing', planning: 'Planning' }[group] || group;
  }
  function statusLabel(status) {
    return { acquired: 'Acquired', learning: 'Learning', future: 'Future', completed: 'Completed', critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', phase: 'Roadmap' }[status] || status;
  }

  // ===== Synapse Particles =====
  const particleGroup = g.append('g').attr('class', 'particles');
  const particles = [];
  const PARTICLE_COUNT = 30;

  function spawnParticle() {
    const e = edges[Math.floor(Math.random() * edges.length)];
    const s = typeof e.source === 'object' ? e.source : null;
    const t = typeof e.target === 'object' ? e.target : null;
    if (!s || !t) return null;

    // Particles on blank neuron edges are dimmer
    const targetNode = nodes.find(n => n.id === (typeof e.target === 'object' ? e.target.id : e.target));
    const isBlankEdge = targetNode && targetNode.state === 'blank';

    const color = nodeColor(t) || '#60a5fa';
    return {
      edge: e, t: 0,
      speed: 0.002 + Math.random() * 0.004,
      color,
      maxOpacity: isBlankEdge ? 0.2 : 0.6,
      sx: s.x, sy: s.y, tx: t.x, ty: t.y
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = spawnParticle();
    if (p) { p.t = Math.random(); particles.push(p); }
  }

  const particleDots = particleGroup.selectAll('circle')
    .data(particles)
    .join('circle')
    .attr('r', 2)
    .attr('fill', d => d.color)
    .attr('opacity', 0.5)
    .attr('filter', 'url(#glow)');

  function animateParticles() {
    particles.forEach(p => {
      p.t += p.speed;
      const s = typeof p.edge.source === 'object' ? p.edge.source : null;
      const t = typeof p.edge.target === 'object' ? p.edge.target : null;
      if (!s || !t) return;
      p.sx = s.x; p.sy = s.y; p.tx = t.x; p.ty = t.y;
      if (p.t > 1) {
        const np = spawnParticle();
        if (np) { Object.assign(p, np); p.t = 0; }
      }
    });

    particleDots
      .attr('cx', d => d.sx + (d.tx - d.sx) * d.t)
      .attr('cy', d => d.sy + (d.ty - d.sy) * d.t)
      .attr('opacity', d => {
        const fade = d.t < 0.1 ? d.t * 10 : d.t > 0.9 ? (1 - d.t) * 10 : 1;
        return fade * d.maxOpacity;
      });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ===== Career Panel =====
  const careerPanel = document.getElementById('career-panel');
  const careerToggle = document.getElementById('career-toggle');

  careerToggle.addEventListener('click', () => {
    careerPanel.classList.toggle('career-collapsed');
  });

  // Load career data and populate skill tags
  fetch('./data/career-paths.json').then(r => r.json()).then(careerData => {
    const pathMap = { path_A: 'A', path_B: 'B', path_C: 'C' };

    careerData.paths.forEach(path => {
      const letter = pathMap[path.id];
      const container = document.getElementById(`career-skills-${letter}`);
      if (!container) return;

      path.must_develop.forEach(skill => {
        const tag = document.createElement('span');
        // Check if this neuron is already fired
        const neuron = nodes.find(n => n.id === skill.neuron);
        const isDone = neuron && neuron.state === 'fired';
        tag.className = `career-skill-tag ${isDone ? 'done' : skill.priority}`;
        tag.textContent = neuron ? neuron.label : skill.neuron;
        tag.style.cursor = 'pointer';
        tag.addEventListener('click', (e) => {
          e.stopPropagation();
          if (neuron) { showPanel(neuron); zoomToNode(neuron); }
        });
        container.appendChild(tag);
      });
    });

    // Click career card to highlight its neurons
    document.querySelectorAll('.career-card').forEach(card => {
      card.addEventListener('click', () => {
        const pathId = card.dataset.path;
        const path = careerData.paths.find(p => p.id === pathId);
        if (!path) return;

        document.querySelectorAll('.career-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Highlight required neurons
        const neuronIds = new Set(path.must_develop.map(s => s.neuron));
        neuronIds.add('core');

        node.style('opacity', d => neuronIds.has(d.id) ? 1 : 0.06);
        link.style('opacity', 0.02);
      });
    });
  }).catch(() => {});

  // ===== Remind Panel =====
  const remindPanel = document.getElementById('remind-panel');
  const remindToggle = document.getElementById('remind-toggle');

  remindToggle.addEventListener('click', () => {
    remindPanel.classList.toggle('remind-collapsed');
  });

  fetch('./data/remind-report.json').then(r => r.json()).then(report => {
    document.getElementById('remind-loading').style.display = 'none';
    document.getElementById('remind-body').style.display = 'block';

    // Gaps
    const gapsEl = document.getElementById('remind-gaps');
    report.gaps.slice(0, 8).forEach(g => {
      const div = document.createElement('div');
      div.className = 'remind-gap-item';
      const icon = g.severity === 'critical' ? '🔴' : g.severity === 'warning' ? '🟡' : '🟢';
      const actionMap = { start: 'Start', deepen: 'Deepen', apply: 'Apply', maintain: 'OK' };
      div.innerHTML = `<span>${icon}</span><span class="remind-gap-label">${g.label}</span><span class="remind-gap-count">${g.prompts}</span><span class="remind-gap-action">${actionMap[g.action] || g.action}</span>`;
      div.style.cursor = 'pointer';
      div.addEventListener('click', () => {
        const n = nodes.find(nd => nd.id === g.id);
        if (n) { showPanel(n); zoomToNode(n); }
      });
      gapsEl.appendChild(div);
    });

    // Risks
    const risksEl = document.getElementById('remind-risks');
    report.risks.forEach(r => {
      const div = document.createElement('div');
      div.className = 'remind-risk-item';
      const barLen = Math.round(r.progress / 10);
      const bar = '█'.repeat(barLen) + '░'.repeat(10 - barLen);
      div.innerHTML = `<span class="remind-risk-label">${r.label}</span><span class="remind-risk-bar">${bar}</span><span class="remind-risk-pct">${r.resolved ? '✓' : r.progress + '%'}</span>`;
      risksEl.appendChild(div);
    });

    // Focus
    const focusEl = document.getElementById('remind-focus');
    if (report.focus) {
      focusEl.innerHTML = `<p class="remind-focus-text">${report.focus.recommendation}</p>`;
    }

    // Recommendations
    const recsEl = document.getElementById('remind-recs');
    if (report.recommendations.must_do.length) {
      report.recommendations.must_do.forEach(r => {
        const div = document.createElement('div');
        div.className = 'remind-rec-item';
        div.textContent = r.label;
        recsEl.appendChild(div);
      });
    }
    if (report.recommendations.suggested_prompts.length) {
      const promptsDiv = document.createElement('div');
      promptsDiv.className = 'remind-prompts';
      report.recommendations.suggested_prompts.forEach(p => {
        const code = document.createElement('code');
        code.textContent = p;
        promptsDiv.appendChild(code);
      });
      recsEl.appendChild(promptsDiv);
    }

    // Update toggle with timestamp
    remindToggle.textContent = `Remind (${report.generated})`;
  }).catch(() => {
    document.getElementById('remind-loading').textContent = 'Report not available';
  });

  // ===== Initial zoom =====
  setTimeout(() => {
    svg.transition().duration(1200)
      .call(zoom.transform, d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.65)
        .translate(-width / 2, -height / 2));
  }, 1500);

})();
