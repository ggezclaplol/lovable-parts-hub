import { ProductWithListings } from '@/hooks/useProducts';

// Build steps in order
export const BUILD_STEPS = [
  { id: 'cpu', name: 'CPU', category: 'CPU', icon: 'Cpu', description: 'Choose your processor' },
  { id: 'motherboard', name: 'Motherboard', category: 'Motherboard', icon: 'CircuitBoard', description: 'Select a compatible motherboard' },
  { id: 'ram', name: 'RAM', category: 'RAM', icon: 'MemoryStick', description: 'Pick your memory' },
  { id: 'gpu', name: 'GPU', category: 'GPU', icon: 'Monitor', description: 'Choose your graphics card' },
  { id: 'storage', name: 'Storage', category: 'Storage', icon: 'HardDrive', description: 'Select your storage drive' },
  { id: 'psu', name: 'PSU', category: 'PSU', icon: 'Zap', description: 'Choose your power supply' },
  { id: 'case', name: 'Case', category: 'Case', icon: 'Box', description: 'Pick your case' },
  { id: 'cooling', name: 'Cooling', category: 'Cooling', icon: 'Fan', description: 'Select cooling solution' },
] as const;

export type BuildStepId = typeof BUILD_STEPS[number]['id'];

export interface BuildSelection {
  product: ProductWithListings;
  listingId: string;
  price: number;
}

export type BuildState = Partial<Record<BuildStepId, BuildSelection>>;

// Extract CPU socket from specs or name
function getCpuSocket(product: ProductWithListings): string | null {
  const specs = product.specs;
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();

  // Check specs for socket
  if (specs.socket) return specs.socket.toUpperCase();
  if (specs.Socket) return specs.Socket.toUpperCase();

  // Infer from CPU brand/name
  if (brand === 'amd') {
    if (name.includes('7') && (name.includes('7950') || name.includes('7900') || name.includes('7800') || name.includes('7700') || name.includes('7600'))) {
      return 'AM5';
    }
    if (name.includes('5') && (name.includes('5600') || name.includes('5800') || name.includes('5900') || name.includes('5950'))) {
      return 'AM4';
    }
    return 'AM4'; // Default AMD
  }
  
  if (brand === 'intel') {
    if (name.includes('14') || name.includes('13') || name.includes('12')) {
      return 'LGA 1700';
    }
    if (name.includes('11') || name.includes('10')) {
      return 'LGA 1200';
    }
    return 'LGA 1700'; // Default Intel
  }

  return null;
}

// Extract motherboard socket from specs
function getMotherboardSocket(product: ProductWithListings): string | null {
  const specs = product.specs;
  
  if (specs.socket) return specs.socket.toUpperCase();
  if (specs.Socket) return specs.Socket.toUpperCase();
  
  // Infer from chipset
  const chipset = (specs.chipset || specs.Chipset || '').toLowerCase();
  if (chipset.includes('b550') || chipset.includes('x570') || chipset.includes('b450') || chipset.includes('x470')) {
    return 'AM4';
  }
  if (chipset.includes('b650') || chipset.includes('x670')) {
    return 'AM5';
  }
  if (chipset.includes('z690') || chipset.includes('b660') || chipset.includes('z790') || chipset.includes('b760')) {
    return 'LGA 1700';
  }
  if (chipset.includes('z490') || chipset.includes('b460') || chipset.includes('z590') || chipset.includes('b560')) {
    return 'LGA 1200';
  }

  return null;
}

// Extract RAM type (DDR4 or DDR5)
function getRamType(product: ProductWithListings): string | null {
  const specs = product.specs;
  const name = product.name.toLowerCase();

  if (specs.type) return specs.type.toUpperCase();
  if (specs.Type) return specs.Type.toUpperCase();
  
  if (name.includes('ddr5')) return 'DDR5';
  if (name.includes('ddr4')) return 'DDR4';

  return null;
}

// Get supported RAM type from motherboard
function getMotherboardRamType(product: ProductWithListings): string | null {
  const specs = product.specs;
  const name = product.name.toLowerCase();
  
  if (specs.memory_type) return specs.memory_type.toUpperCase();
  if (specs.Memory) return specs.Memory.toUpperCase();
  
  // Infer from chipset - newer chipsets typically support DDR5
  const chipset = (specs.chipset || specs.Chipset || '').toLowerCase();
  
  // AM5 and newer Intel (600/700 series) support DDR5
  if (chipset.includes('b650') || chipset.includes('x670')) {
    return 'DDR5';
  }
  if (chipset.includes('z690') || chipset.includes('z790') || chipset.includes('b760')) {
    return 'DDR5'; // These can support both, but prefer DDR5
  }
  
  // Older chipsets are DDR4
  if (chipset.includes('b550') || chipset.includes('x570') || chipset.includes('b660')) {
    return 'DDR4';
  }

  return null;
}

// Get TDP from CPU/GPU for PSU calculation
function getComponentTdp(product: ProductWithListings): number {
  const specs = product.specs;
  const tdpValue = specs.tdp || specs.TDP || specs.power || '';
  
  if (typeof tdpValue === 'string') {
    const match = tdpValue.match(/(\d+)/);
    if (match) return parseInt(match[1]);
  }
  if (typeof tdpValue === 'number') return tdpValue;
  
  return 0;
}

// Main compatibility check function
export function checkCompatibility(
  product: ProductWithListings,
  stepId: BuildStepId,
  currentBuild: BuildState
): { compatible: boolean; reason?: string; warning?: string } {
  
  switch (stepId) {
    case 'cpu':
      // CPUs are always compatible as first selection
      return { compatible: true };

    case 'motherboard': {
      const selectedCpu = currentBuild.cpu?.product;
      if (!selectedCpu) {
        return { compatible: true, warning: 'Select a CPU first for compatibility check' };
      }

      const cpuSocket = getCpuSocket(selectedCpu);
      const moboSocket = getMotherboardSocket(product);

      if (cpuSocket && moboSocket) {
        const cpuSocketNorm = cpuSocket.replace(/\s+/g, '').toUpperCase();
        const moboSocketNorm = moboSocket.replace(/\s+/g, '').toUpperCase();
        
        if (cpuSocketNorm !== moboSocketNorm) {
          return { 
            compatible: false, 
            reason: `Socket mismatch: CPU uses ${cpuSocket}, motherboard has ${moboSocket}` 
          };
        }
        return { compatible: true };
      }

      return { compatible: true, warning: 'Could not verify socket compatibility' };
    }

    case 'ram': {
      const selectedMobo = currentBuild.motherboard?.product;
      if (!selectedMobo) {
        return { compatible: true, warning: 'Select a motherboard first for compatibility check' };
      }

      const ramType = getRamType(product);
      const moboRamType = getMotherboardRamType(selectedMobo);

      if (ramType && moboRamType) {
        if (ramType !== moboRamType) {
          return { 
            compatible: false, 
            reason: `RAM type mismatch: ${ramType} RAM not compatible with ${moboRamType} motherboard` 
          };
        }
        return { compatible: true };
      }

      return { compatible: true, warning: 'Could not verify RAM compatibility' };
    }

    case 'gpu':
      // GPUs are generally compatible with all modern motherboards (PCIe)
      return { compatible: true };

    case 'storage':
      // Storage is generally compatible
      return { compatible: true };

    case 'psu': {
      // Calculate rough power requirement
      const cpuTdp = currentBuild.cpu?.product ? getComponentTdp(currentBuild.cpu.product) : 0;
      const gpuTdp = currentBuild.gpu?.product ? getComponentTdp(currentBuild.gpu.product) : 0;
      const estimatedPower = cpuTdp + gpuTdp + 100; // +100W for other components

      const psuWattage = getComponentTdp(product);
      
      if (psuWattage > 0 && estimatedPower > psuWattage * 0.8) {
        return { 
          compatible: true, 
          warning: `Estimated power draw (~${estimatedPower}W) is close to PSU capacity (${psuWattage}W)` 
        };
      }

      return { compatible: true };
    }

    case 'case':
    case 'cooling':
      // These are generally compatible, form factor checks could be added
      return { compatible: true };

    default:
      return { compatible: true };
  }
}

// Filter products to show compatible first
export function sortByCompatibility(
  products: ProductWithListings[],
  stepId: BuildStepId,
  currentBuild: BuildState
): ProductWithListings[] {
  return [...products].sort((a, b) => {
    const aCompat = checkCompatibility(a, stepId, currentBuild);
    const bCompat = checkCompatibility(b, stepId, currentBuild);

    // Compatible items first
    if (aCompat.compatible && !bCompat.compatible) return -1;
    if (!aCompat.compatible && bCompat.compatible) return 1;

    // Items without warnings before those with warnings
    if (!aCompat.warning && bCompat.warning) return -1;
    if (aCompat.warning && !bCompat.warning) return 1;

    // Then by price
    return a.lowest_price - b.lowest_price;
  });
}

// Calculate total build price
export function calculateBuildTotal(build: BuildState): number {
  return Object.values(build).reduce((total, selection) => {
    return total + (selection?.price || 0);
  }, 0);
}
