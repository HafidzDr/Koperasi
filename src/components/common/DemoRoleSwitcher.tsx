import React from "react";
import { FloatingSettingsController } from "./FloatingSettingsController";

/**
 * @deprecated DemoRoleSwitcher is deprecated in Stage 2.
 * Replaced by FloatingSettingsController for unified bottom-right floating governance.
 */
export const DemoRoleSwitcher: React.FC = () => {
  return <FloatingSettingsController />;
};
