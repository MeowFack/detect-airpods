import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useMediaDevices } from '../utils/useMediaDevices';

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const HomePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const devices = useMediaDevices();
  const airpods = devices.find((device) =>
    device.label.toLowerCase().includes('airpods'),
  );

  // FIXME: replace hardcoded value
  const hadAirpodsBefore = useRef<boolean>(false);
  const [hasAirpods, setHasAirpods] = useState<boolean>(false);
  useEffect(() => {
    let tick = false;
    let interval: NodeJS.Timeout;

    setTimeout(() => {
      interval = setInterval(() => {
        tick = !tick;
        setHasAirpods(tick);
      }, 5000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentFrame = useCallback(
    (index: number) => `/airpods/${index}.jpg`,
    [],
  );

  const animate = useCallback(async (fromIndex, toIndex, fps = 48) => {
    const delayAsSeconds = 1.0 / fps;
    const context = canvasRef.current.getContext('2d');

    if (fromIndex === toIndex) {
      return;
    }

    const img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };

    const isFromBack = fromIndex > toIndex;
    if (!isFromBack) {
      for (let i = fromIndex; i <= toIndex; i++) {
        img.src = getCurrentFrame(i);
        await delay(delayAsSeconds * 1000);
      }
    } else {
      for (let i = fromIndex; i >= toIndex; i--) {
        img.src = getCurrentFrame(i);
        await delay(delayAsSeconds * 1000);
      }
    }
  }, []);

  const dismissAirpods = useCallback(() => animate(1, 148), []);
  const presentAirpods = useCallback(() => animate(148, 1), []);

  useEffect(() => {
    const preloadImages = () => {
      for (let i = 1; i < 148; i++) {
        const img = new Image();
        img.src = getCurrentFrame(i);
      }
    };
    preloadImages();
  }, []);

  const [text, setText] = useState<string>('');
  useEffect(() => {
    if (hasAirpods) {
      hadAirpodsBefore.current = true;
      setText('');
      presentAirpods();
    } else if (hadAirpodsBefore.current) {
      dismissAirpods().then(() => setText('Connect your Airpods'));
    } else {
      setText('Connect your Airpods');
    }
  }, [hasAirpods]);

  return (
    <Container>
      <AnimatePresence>
        <Airpods ref={canvasRef} width={1158} height={770} />
        {text && (
          <TextContainer
            key="text"
            initial={{ opacity: 0, transform: 'scale(3)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0.8)' }}
          >
            <Text>{text}</Text>
          </TextContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Airpods = styled.canvas`
  width: 85%;
  max-width: 800px;
`;

const TextContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
`;
const Text = styled.h1`
  margin: 0;
  color: white;
  font-size: 2.8rem;
  text-align: center;
  word-break: keep-all;

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }

  @media (max-width: 350px) {
    font-size: 1.45rem;
  }
`;
