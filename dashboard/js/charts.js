/**
 * Charts functionality for the AUB Thesis Dashboard
 * Creates and manages all Chart.js visualizations
 */

/**
 * Initialize all charts
 */
function initCharts() {
    // Wait a moment for the DOM to be fully ready with components
    setTimeout(() => {
        // Demographics charts
        createAgeDistributionChart();
        createParityChart();
        createComplaintsChart();
        createDrugHistoryChart();
        
        // Findings charts
        createHistopathologyChart();
        
        // Add zoom reset buttons to all charts
        addZoomResetButtons();
    }, 100);
}

/**
 * Create age distribution chart
 */
function createAgeDistributionChart() {
    const ctx = document.getElementById('age-distribution-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['20-30', '31-40', '41-50', '51-60', '61-70'],
            datasets: [{
                label: 'Number of Patients',
                data: [15, 23, 42, 18, 7],
                backgroundColor: '#0d9488',
                borderColor: '#0d9488',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Patients: ${context.raw}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Patients'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Age Group (years)'
                    }
                }
            }
        }
    });
    
    // Store chart instance for later reference
    dashboardState.chartInstances.ageDistribution = chart;
}

/**
 * Create parity chart
 */
function createParityChart() {
    const ctx = document.getElementById('parity-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Nullipara', 'Primipara', 'Multipara', 'Grand Multipara'],
            datasets: [{
                label: 'Number of Patients',
                data: [12, 18, 56, 19],
                backgroundColor: '#0891b2',
                borderColor: '#0891b2',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Patients: ${context.raw}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Patients'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Parity'
                    }
                }
            }
        }
    });
    
    // Store chart instance
    dashboardState.chartInstances.parity = chart;
}

/**
 * Create complaints chart
 */
function createComplaintsChart() {
    const ctx = document.getElementById('complaints-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Heavy Menstrual Bleeding', 'Irregular Bleeding', 'Intermenstrual Bleeding', 'Postmenopausal Bleeding', 'Prolonged Bleeding'],
            datasets: [{
                label: 'Number of Patients',
                data: [45, 28, 15, 8, 9],
                backgroundColor: '#4338ca',
                borderColor: '#4338ca',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Patients: ${context.raw}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Patients'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Complaint Type'
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    // Store chart instance
    dashboardState.chartInstances.complaints = chart;
}

/**
 * Create drug history chart
 */
function createDrugHistoryChart() {
    const ctx = document.getElementById('drug-history-chart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['No Drug History', 'Oral Contraceptives', 'HRT', 'Other Hormonal Therapy'],
            datasets: [{
                label: 'Number of Patients',
                data: [63, 18, 7, 17],
                backgroundColor: ['#0d9488', '#f97316', '#6366f1', '#8b5cf6'],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Store chart instance
    dashboardState.chartInstances.drugHistory = chart;
}

/**
 * Create histopathology chart
 */
function createHistopathologyChart() {
    const ctx = document.getElementById('histopathologyChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Proliferative Phase', 'Secretory Phase', 'Endometrial Polyp', 'Endometrial Hyperplasia', 'Endometritis', 'Carcinoma', 'Pill Endometrium'],
            datasets: [{
                label: 'Number of Cases',
                data: [21, 18, 16, 23, 11, 7, 9],
                backgroundColor: '#0d9488',
                borderColor: '#0d9488',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Cases: ${context.raw}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Cases'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Histopathological Diagnosis'
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    // Store chart instance
    dashboardState.chartInstances.histopathology = chart;
}

/**
 * Add zoom reset buttons to all charts
 */
function addZoomResetButtons() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-zoom-btn absolute top-2 right-2 bg-white dark:bg-gray-700 p-1 rounded shadow-sm text-sm hidden';
        resetButton.innerHTML = '<i class="fas fa-undo"></i> Reset Zoom';
        resetButton.setAttribute('aria-label', 'Reset chart zoom');
        container.appendChild(resetButton);
        
        // Get the chart canvas
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        
        // Get the chart instance
        const chartId = canvas.id;
        const chart = dashboardState.chartInstances[chartId.replace('-chart', '')];
        
        if (!chart || !chart.options.plugins.zoom) return;
        
        // Show button when zoomed
        chart.options.plugins.zoom.zoom.onZoom = () => {
            resetButton.classList.remove('hidden');
        };
        
        // Reset zoom when clicked
        resetButton.addEventListener('click', () => {
            chart.resetZoom();
            resetButton.classList.add('hidden');
        });
    });
}