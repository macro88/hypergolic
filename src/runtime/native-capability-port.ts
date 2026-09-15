import { requireNativeModule } from 'expo';
import type { RuntimeNativePort } from './runtime-owner';

interface CapabilityModule {
  newInstanceId(): string;
  takeCapability(token: string): string | null;
  isCapabilityActive(token: string): boolean;
  finishCapability(token: string, response: string | null): void;
}
export function loadNativeCapabilityPort(): RuntimeNativePort {
  const module = requireNativeModule<CapabilityModule>('HypergolicNappletHost');
  return Object.freeze({ newInstanceId: () => module.newInstanceId(), take: (token: string) => module.takeCapability(token),
    isActive: (token: string) => module.isCapabilityActive(token),
    finish: (token: string, response: string | null) => module.finishCapability(token, response) });
}
