/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './store';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
