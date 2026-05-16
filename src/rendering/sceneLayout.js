export const SCENE_SIZE = { width: 1280, height: 720 };

const PALETTES = {
  normal: { sky: '#FEFCF8', wash: 'rgba(222, 228, 228, 0.18)' },
  flow: { sky: '#ECFFF2', wash: 'rgba(186, 255, 202, 0.24)' },
  bad: { sky: '#FCE9E6', wash: 'rgba(242, 202, 153, 0.2)' },
};

export function getScenePalette(emotion) {
  if (emotion === 'flow') return PALETTES.flow;
  if (emotion === 'frustrated' || emotion === 'bored') return PALETTES.bad;
  return PALETTES.normal;
}

export function getIndicatorAssetKey(emotion) {
  if (emotion === 'flow') return 'indicatorGood';
  if (emotion === 'frustrated' || emotion === 'bored') return 'indicatorBad';
  return 'indicatorNormal';
}

export function fitByHeight(asset, height) {
  return {
    width: (asset.width / asset.height) * height,
    height,
  };
}

function getPirateRect(asset) {
  return { x: 52, y: 470, ...fitByHeight(asset, 190) };
}

export function getSceneLayout(assets) {
  return {
    skyDetails: { x: 42, y: 38, ...fitByHeight(assets.skyDetails, 162) },
    indicatorBand: { x: 0, y: 260, width: SCENE_SIZE.width, height: 330 },
    platformBand: { y: 610, height: 110 },
    pirate: {
      normal: getPirateRect(assets.pirateNormal),
      frustrated: getPirateRect(assets.pirateFrustrated ?? assets.pirateNormal),
      bored: getPirateRect(assets.pirateBored ?? assets.pirateNormal),
      inFlow: getPirateRect(assets.pirateInFlow ?? assets.pirateNormal),
    },
    ship: {
      small: { x: 900, y: 430, ...fitByHeight(assets.ship, 170) },
      large: { x: 760, y: 320, ...fitByHeight(assets.ship, 330) },
    },
    waveBand: { x: 0, y: 648, width: SCENE_SIZE.width, height: 88 },
  };
}
