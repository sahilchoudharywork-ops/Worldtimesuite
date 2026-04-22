// Minimal ambient declaration for react-globe.gl.
// Full types come from the package itself once `npm install` is run.
// This file exists only so TypeScript doesn't error before install.
declare module 'react-globe.gl' {
  import React from 'react';

  export interface GlobeMethods {
    controls: () => any;
    pointOfView: (pov: { lat: number; lng: number; altitude: number }, ms?: number) => void;
    scene: () => any;
    camera: () => any;
    renderer: () => any;
    toGlobeCoords: (x: number, y: number) => { lat: number; lng: number } | null;
  }

  export interface GlobeProps {
    ref?: React.Ref<GlobeMethods>;
    width?: number;
    height?: number;
    globeImageUrl?: string;
    backgroundImageUrl?: string;
    backgroundColor?: string;
    atmosphereColor?: string;
    atmosphereAltitude?: number;
    polygonsData?: object[];
    polygonCapColor?: (d: object) => string;
    polygonSideColor?: (d: object) => string;
    polygonStrokeColor?: (d: object) => string;
    polygonLabel?: (d: object) => string;
    onPolygonHover?: (polygon: object | null, prevPolygon: object | null) => void;
    polygonsTransitionDuration?: number;
    [key: string]: any;
  }

  const Globe: React.ForwardRefExoticComponent<GlobeProps & React.RefAttributes<GlobeMethods>>;
  export default Globe;
}
