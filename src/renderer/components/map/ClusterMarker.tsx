import { DivIcon } from 'leaflet';

/**
 * Creates a cluster marker icon for multiple photos at the same location
 */
export const createClusterIcon = (count: number): DivIcon => {
  return new DivIcon({
    className: 'cluster-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #58a0ff;
        border: 3px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${count}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};
