/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DB_VisualizationConfig.gs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 0.1 PERCENTILE VISUALIZATION SPECIFICATIONS
 * 
 * This module contains:
 * - Chart Type Specifications per Section
 * - Animation Standards
 * - Color System
 * - Interactivity Configuration
 * - Global Visualization Settings
 * 
 * @version 1.0.0
 * @author SerpifAI Elite Intelligence System
 */

/**
 * Returns the complete visualization configuration object
 * @returns {Object} Full visualization configuration
 */
function getVisualizationConfig() {
  return {
    globalInteractivity: {
      hoverTooltips: true,
      clickToExpand: true,
      dragToCompare: true,
      zoomPan: true,
      animateOnScroll: true,
      responsiveDesign: true,
      keyboardNavigation: true,
      touchSupport: true
    },
    colorPalette: {
      primary: ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
      secondary: ["#3B82F6", "#06B6D4", "#14B8A6", "#84CC16", "#EAB308"],
      gradient: {
        primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        danger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        warning: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
      },
      status: {
        critical: "#EF4444",
        high: "#F59E0B",
        medium: "#3B82F6",
        low: "#10B981",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#6366F1"
      },
      competitors: ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4", "#8B5CF6"],
      background: {
        dark: "#0F172A",
        mid: "#1E293B",
        light: "#334155",
        surface: "#475569"
      }
    },
    animationPresets: {
      entry: {
        delay: 100,
        duration: 800,
        stagger: 50,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      hover: {
        duration: 200,
        scale: 1.05,
        easing: "ease-out"
      },
      click: {
        duration: 300,
        easing: "ease-in-out"
      },
      pulse: {
        duration: 1500,
        iterations: "infinite",
        easing: "ease-in-out"
      },
      scroll: {
        threshold: 0.2,
        duration: 1200,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    },
    chartDefaults: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontSize: 12,
      titleSize: 16,
      labelSize: 11,
      borderRadius: 8,
      padding: 16,
      aspectRatio: 16/9
    }
  };
}

/**
 * Returns chart type specifications for each section
 * @returns {Object} Section-to-chart mapping with full specifications
 */
function getChartTypeSpecs() {
  return {
    // Section 1: Customer Intelligence
    section1: {
      sectionName: "Customer Intelligence",
      charts: {
        audienceRadar: {
          type: "radar",
          axes: 6,
          interaction: "hover-highlight",
          animation: "spiral-in",
          dataPoints: ["Pain Intensity", "Desire Strength", "Urgency", "Willingness to Pay", "Brand Awareness", "Competitive Loyalty"],
          description: "Multi-dimensional audience profiling"
        },
        painHeatmap: {
          type: "heatmap",
          colorScale: "red-yellow-green",
          interaction: "cell-click",
          animation: "fade-cells",
          rows: "Pain Categories",
          cols: "Audience Segments",
          description: "Pain point intensity by segment"
        },
        mindsetTransformation: {
          type: "sankey",
          flow: "left-to-right",
          interaction: "path-highlight",
          animation: "flow-particles",
          description: "Belief transformation journey"
        }
      }
    },
    
    // Section 2: Jobs-To-Be-Done
    section2: {
      sectionName: "JTBD Framework",
      charts: {
        jtbdSankey: {
          type: "sankey",
          flow: "left-to-right",
          interaction: "path-highlight",
          animation: "flow-particles",
          nodes: ["Trigger", "Primary Job", "Secondary Job", "Outcome"],
          description: "Job chain flow visualization"
        },
        jobPriorityMatrix: {
          type: "matrix",
          quadrants: 4,
          axes: ["Urgency", "Importance"],
          interaction: "click-expand",
          animation: "gravity-settle",
          description: "Job prioritization by urgency vs importance"
        },
        hiringCriteria: {
          type: "treemap",
          depth: 2,
          interaction: "drill-down",
          animation: "zoom-transition",
          categories: ["Functional", "Emotional", "Social"],
          description: "Hiring criteria by category"
        }
      }
    },
    
    // Section 3: Competitive Warfare
    section3: {
      sectionName: "Competitive Warfare",
      charts: {
        competitorThreatRadar: {
          type: "radar",
          axes: 8,
          interaction: "drag-compare",
          animation: "expand-out",
          dimensions: ["Authority", "Content", "Technical", "Brand", "Distribution", "Pricing", "Innovation", "Resources"],
          description: "Multi-competitor threat assessment"
        },
        authorityTreemap: {
          type: "treemap",
          valueSize: true,
          interaction: "click-drill",
          animation: "grow-boxes",
          metric: "Domain Authority",
          description: "Competitor authority distribution"
        },
        killMoveTimeline: {
          type: "gantt",
          dependencies: true,
          interaction: "drag-resize",
          animation: "slide-in",
          description: "Kill move execution timeline"
        }
      }
    },
    
    // Section 4: Blue Ocean Strategy
    section4: {
      sectionName: "Blue Ocean Strategy",
      charts: {
        valueCurve: {
          type: "line",
          multiSeries: true,
          interaction: "point-tooltip",
          animation: "draw-line",
          series: ["Your Brand", "Competitor 1", "Competitor 2", "Industry Average"],
          description: "Value curve comparison"
        },
        opportunityBubble: {
          type: "bubble",
          dimensions: 3,
          axes: ["Market Size", "Competition Level", "Fit Score"],
          interaction: "zoom-pan",
          animation: "float-in",
          description: "Opportunity sizing matrix"
        },
        errcFramework: {
          type: "bar",
          grouped: true,
          interaction: "hover-compare",
          animation: "grow-bars",
          categories: ["Eliminate", "Reduce", "Raise", "Create"],
          description: "ERRC framework visualization"
        }
      }
    },
    
    // Section 5: Brand Positioning
    section5: {
      sectionName: "Brand Positioning",
      charts: {
        positioningMatrix: {
          type: "scatter",
          quadrants: 4,
          interaction: "drag-position",
          animation: "gravity-settle",
          axes: ["Tactical ↔ Strategic", "Commodity ↔ Premium"],
          description: "Perceptual positioning map"
        },
        mentalAvailability: {
          type: "radar",
          axes: 6,
          interaction: "click-segments",
          animation: "wave-fill",
          dimensions: ["Awareness", "Recall", "Association", "Preference", "Loyalty", "Advocacy"],
          description: "Mental availability metrics"
        },
        brandArchetype: {
          type: "donut",
          interaction: "hover-expand",
          animation: "spin-reveal",
          description: "Brand archetype composition"
        }
      }
    },
    
    // Section 6: Content Strategy
    section6: {
      sectionName: "Content Strategy",
      charts: {
        pillarMindMap: {
          type: "force-directed",
          links: true,
          interaction: "drag-nodes",
          animation: "force-simulation",
          levels: ["Center Topic", "Pillars", "Clusters", "Keywords"],
          description: "Interactive pillar-cluster-keyword hierarchy"
        },
        pillarTreemap: {
          type: "treemap",
          depth: 3,
          interaction: "drill-down",
          animation: "zoom-transition",
          levels: ["Pillar", "Cluster", "Keyword"],
          description: "Content pillar size by opportunity"
        },
        contentVelocity: {
          type: "line",
          multiSeries: true,
          interaction: "hover-compare",
          animation: "draw-line",
          description: "Content velocity vs competitors"
        }
      }
    },
    
    // Section 7: Strategic Moat
    section7: {
      sectionName: "Strategic Moat",
      charts: {
        moatGauge: {
          type: "gauge",
          ranges: 3,
          interaction: "hover-details",
          animation: "needle-swing",
          thresholds: { weak: 3, moderate: 6, strong: 8 },
          description: "Overall moat strength indicator"
        },
        moatRadar: {
          type: "radar",
          axes: 5,
          interaction: "hover-highlight",
          animation: "wave-fill",
          dimensions: ["Content Moat", "Authority Moat", "Distribution Moat", "Brand Moat", "Network Effect"],
          description: "Multi-dimensional moat assessment"
        },
        vulnerabilityTimeline: {
          type: "line",
          areaFill: true,
          interaction: "hover-tooltip",
          animation: "draw-line",
          description: "Moat vulnerability over time"
        }
      }
    },
    
    // Section 8: Action Plan
    section8: {
      sectionName: "Action Plan",
      charts: {
        ganttTimeline: {
          type: "gantt",
          dependencies: true,
          interaction: "drag-reorder",
          animation: "slide-in",
          milestones: true,
          description: "90-day execution timeline"
        },
        priorityMatrix: {
          type: "matrix",
          quadrants: 4,
          axes: ["Impact", "Effort"],
          interaction: "drag-reorder",
          animation: "shuffle",
          description: "Impact vs effort prioritization"
        },
        resourceAllocation: {
          type: "stacked-bar",
          interaction: "hover-breakdown",
          animation: "grow-bars",
          description: "Resource allocation by initiative"
        }
      }
    },
    
    // Section 9: AEO Citation Analysis
    section9: {
      sectionName: "AEO Citation Analysis",
      charts: {
        citationFunnel: {
          type: "funnel",
          stages: 4,
          interaction: "hover-expand",
          animation: "cascade-down",
          stages: ["Indexed", "Cited", "Featured", "Primary Source"],
          description: "AI citation funnel"
        },
        ragReadinessGauge: {
          type: "gauge",
          ranges: 3,
          interaction: "hover-details",
          animation: "needle-swing",
          description: "RAG readiness score"
        },
        citeabilityComparison: {
          type: "bar",
          horizontal: true,
          interaction: "hover-compare",
          animation: "grow-bars",
          description: "Cite-ability score by competitor"
        }
      }
    },
    
    // Section 10: Asset Valuation
    section10: {
      sectionName: "Digital Asset Valuation",
      charts: {
        assetTreemap: {
          type: "treemap",
          valueSize: true,
          interaction: "click-drill",
          animation: "grow-boxes",
          metric: "Organic Trust Value",
          description: "Asset value by competitor"
        },
        roiScatter: {
          type: "scatter",
          axes: ["Investment", "Return"],
          interaction: "hover-tooltip",
          animation: "float-in",
          description: "Investment vs return analysis"
        },
        moatMultiplier: {
          type: "bar",
          grouped: true,
          interaction: "hover-compare",
          animation: "grow-bars",
          description: "Moat multiplier breakdown"
        }
      }
    },
    
    // Section 11: Brittleness Prediction
    section11: {
      sectionName: "Brittleness Prediction",
      charts: {
        riskMatrix: {
          type: "matrix",
          colorScale: "risk",
          interaction: "pulse-critical",
          animation: "heartbeat",
          axes: ["Impact", "Probability"],
          description: "Risk matrix by competitor"
        },
        brittlenessGauge: {
          type: "gauge",
          ranges: 3,
          interaction: "hover-details",
          animation: "needle-swing",
          thresholds: { stable: 40, moderate: 70, critical: 100 },
          description: "Brittleness score indicator"
        },
        collapseTimeline: {
          type: "line",
          areaFill: true,
          markers: true,
          interaction: "hover-tooltip",
          animation: "draw-line",
          description: "Collapse probability over time"
        }
      }
    },
    
    // Section 12: Information Black Holes
    section12: {
      sectionName: "Information Black Holes",
      charts: {
        entityNetwork: {
          type: "network",
          clusters: true,
          interaction: "force-drag",
          animation: "spring-physics",
          nodeTypes: ["Owned", "Contested", "Unowned"],
          description: "Semantic entity ownership map"
        },
        topicCoverage: {
          type: "heatmap",
          colorScale: "coverage",
          interaction: "cell-click",
          animation: "fade-cells",
          description: "Topic coverage by competitor"
        },
        blackHoleBubble: {
          type: "bubble",
          dimensions: 3,
          axes: ["Search Volume", "Competition", "AI Citation Potential"],
          interaction: "zoom-pan",
          animation: "float-in",
          description: "Black hole opportunity sizing"
        }
      }
    },
    
    // Section 13: Strategic Imperatives
    section13: {
      sectionName: "Strategic Imperatives",
      charts: {
        prioritySankey: {
          type: "sankey",
          flow: "left-to-right",
          interaction: "path-highlight",
          animation: "flow-particles",
          nodes: ["Category", "Initiative", "Outcome"],
          description: "Initiative flow to outcomes"
        },
        imperativeTimeline: {
          type: "gantt",
          dependencies: true,
          interaction: "drag-resize",
          animation: "slide-in",
          description: "Top 10 imperative timeline"
        },
        impactEffortMatrix: {
          type: "matrix",
          quadrants: 4,
          interaction: "drag-reorder",
          animation: "shuffle",
          description: "Imperative prioritization"
        }
      }
    },
    
    // Section 14: Cross-Stage Synthesis
    section14: {
      sectionName: "Cross-Stage Synthesis",
      charts: {
        masterRadar: {
          type: "radar",
          axes: 14,
          interaction: "full-interactive",
          animation: "wave-fill",
          description: "All-section performance radar"
        },
        synthesisDashboard: {
          type: "dashboard",
          widgets: ["gauges", "sparklines", "kpis"],
          interaction: "widget-expand",
          animation: "stagger-reveal",
          description: "Executive synthesis dashboard"
        },
        stageHandoff: {
          type: "sankey",
          flow: "top-to-bottom",
          interaction: "path-highlight",
          animation: "flow-particles",
          nodes: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"],
          description: "Data flow between stages"
        }
      }
    }
  };
}

/**
 * Returns the chart specification for a specific section
 * @param {number} sectionNum - Section number (1-14)
 * @returns {Object} Chart specifications for that section
 */
function getChartSpecsForSection(sectionNum) {
  const allSpecs = getChartTypeSpecs();
  return allSpecs[`section${sectionNum}`] || null;
}

/**
 * Returns the visualization JSON block to include in Gemini prompts
 * @returns {string} JSON schema for visualization data
 */
function getVisualizationJSONSchema() {
  return `
"visualizationConfig": {
  "globalInteractivity": {
    "hoverTooltips": true,
    "clickToExpand": true,
    "dragToCompare": true,
    "zoomPan": true,
    "animateOnScroll": true,
    "responsiveDesign": true
  },
  "colorPalette": {
    "primary": ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
    "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "danger": "#EF4444",
    "success": "#10B981",
    "warning": "#F59E0B"
  },
  "animationPresets": {
    "entryDelay": 100,
    "duration": 800,
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
  }
},
"chartTypeSpecs": {
  "audienceRadar": {"type": "radar", "axes": 6, "interaction": "hover-highlight", "animation": "spiral-in"},
  "painHeatmap": {"type": "heatmap", "colorScale": "red-yellow-green", "interaction": "cell-click", "animation": "fade-cells"},
  "jtbdSankey": {"type": "sankey", "flow": "left-to-right", "interaction": "path-highlight", "animation": "flow-particles"},
  "competitorThreatRadar": {"type": "radar", "axes": 8, "interaction": "drag-compare", "animation": "expand-out"},
  "bluOceanValueCurve": {"type": "line", "multiSeries": true, "interaction": "point-tooltip", "animation": "draw-line"},
  "opportunityBubble": {"type": "bubble", "dimensions": 3, "interaction": "zoom-pan", "animation": "float-in"},
  "positioningMatrix": {"type": "scatter", "quadrants": 4, "interaction": "drag-position", "animation": "gravity-settle"},
  "pillarTreemap": {"type": "treemap", "depth": 3, "interaction": "drill-down", "animation": "zoom-transition"},
  "pillarMindMap": {"type": "force-directed", "links": true, "interaction": "drag-nodes", "animation": "force-simulation"},
  "moatGauge": {"type": "gauge", "ranges": 3, "interaction": "hover-details", "animation": "needle-swing"},
  "ganttTimeline": {"type": "gantt", "dependencies": true, "interaction": "drag-resize", "animation": "slide-in"},
  "priorityMatrix": {"type": "matrix", "quadrants": 4, "interaction": "drag-reorder", "animation": "shuffle"},
  "citationFunnel": {"type": "funnel", "stages": 4, "interaction": "hover-expand", "animation": "cascade-down"},
  "assetTreemap": {"type": "treemap", "valueSize": true, "interaction": "click-drill", "animation": "grow-boxes"},
  "riskMatrix": {"type": "matrix", "colorScale": "risk", "interaction": "pulse-critical", "animation": "heartbeat"},
  "entityNetwork": {"type": "network", "clusters": true, "interaction": "force-drag", "animation": "spring-physics"},
  "masterRadar": {"type": "radar", "axes": 14, "interaction": "full-interactive", "animation": "wave-fill"}
}`;
}

/**
 * Returns animation CSS keyframes for frontend use
 * @returns {string} CSS keyframe definitions
 */
function getAnimationKeyframes() {
  return `
@keyframes spiralIn {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes fadeCell {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes flowParticles {
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
}

@keyframes expandOut {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes drawLine {
  0% { stroke-dasharray: 0 1000; }
  100% { stroke-dasharray: 1000 0; }
}

@keyframes floatIn {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes gravitySettle {
  0% { transform: translateY(-50px); }
  60% { transform: translateY(10px); }
  100% { transform: translateY(0); }
}

@keyframes zoomTransition {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes forceSimulation {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes needleSwing {
  0% { transform: rotate(-90deg); }
  70% { transform: rotate(10deg); }
  100% { transform: rotate(0deg); }
}

@keyframes slideIn {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes shuffleIn {
  0% { transform: translateY(20px) rotate(5deg); opacity: 0; }
  100% { transform: translateY(0) rotate(0deg); opacity: 1; }
}

@keyframes cascadeDown {
  0% { transform: scaleY(0); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
}

@keyframes growBoxes {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes springPhysics {
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes waveFill {
  0% { clip-path: polygon(50% 50%, 50% 50%, 50% 50%); }
  100% { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
}

@keyframes staggerReveal {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;
}
