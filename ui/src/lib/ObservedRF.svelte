<script lang="ts">
  import type { NodeInfo } from 'api/src/vars'
  export let node: NodeInfo

  function calculateRFSNRWidthPercentage(snr: number) {
    // calculate a relative width percentage to represent a bar of SNR values

    const MIN_WIDTH = 15; // Minimum width percentage
    const MAX_SNR = 10;   // SNR value for 100% width
    const MIN_SNR = -10;  // SNR value corresponding to minimum width
    
    // Limit SNR within our expected range
    const clampedSNR = Math.max(MIN_SNR, Math.min(MAX_SNR, snr));
    
    if (clampedSNR >= MAX_SNR) {
      return 100; // Maximum width
    } else {
      // Linear scale from MIN_WIDTH to 100% based on SNR range
      // For SNR from -10 to +10, map to width from 10% to 100%
      const availableRange = 100 - MIN_WIDTH;
      const snrPosition = (clampedSNR - MIN_SNR) / (MAX_SNR - MIN_SNR);
      
      return MIN_WIDTH + (snrPosition * availableRange);
    }
  }

  function getRFSNRColor(snr: number) {
    // determine which color to use for the SNR bar values
    if (snr >= 4) return 'bg-green-500'
    if (snr >= 0) return 'bg-[#9acd32]'
    if (snr >= -3) return 'bg-yellow-500'
    if (snr >= -6) return 'bg-orange-500'
    if (snr >= -9) return 'bg-red-500'
    return 'bg-[red]'
  }
</script>


              <!-- SNR -->
              <div title="SNR" class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div  class="h-0.5 -translate-y-0.5 scale-x-90 {getRFSNRColor(node.snr)}" 
                      style="width: {calculateRFSNRWidthPercentage(node.snr)}%; 
                             background-color: 'steelblue';"></div>
              </div>

              <!-- RSSI -->
              <div title="RSSI" class="text-sm w-8 shrink-0 text-center bg-black/20 rounded h-5">
                {node.rssi || '-'}
              </div>