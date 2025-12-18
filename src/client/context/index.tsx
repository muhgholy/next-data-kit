/**
 * next-data-kit - DataKitContext
 *
 * React context for sharing next-data-kit state across components.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TUseDataKitReturn } from '../../types';


export type TDataKitContextValue<T = unknown, R = unknown> = TUseDataKitReturn<T, R>;


export const createDataKitContext = <T = unknown, R = unknown>() => {
     const Context = createContext<TDataKitContextValue<T, R> | null>(null);

     // ** Provider component for next-data-kit context
     const DataKitProvider = (props: Readonly<{
          value: TDataKitContextValue<T, R>;
          children: ReactNode;
     }>) => {
          const { value, children } = props;
          return <Context.Provider value={value}>{children}</Context.Provider>;
     };

     // ** Hook to access next-data-kit context
     const useDataKitContext = (): TDataKitContextValue<T, R> => {
          const context = useContext(Context);
          if (!context) {
               throw new Error('useDataKitContext must be used within a DataKitProvider');
          }
          return context;
     };

     return { DataKitProvider, useDataKitContext, Context };
};


const {
     DataKitProvider: DefaultDataKitProvider,
     useDataKitContext: useDefaultDataKitContext,
     Context: DefaultDataKitContext,
} = createDataKitContext();

export {
     DefaultDataKitProvider as DataKitProvider,
     useDefaultDataKitContext as useDataKitContext,
     DefaultDataKitContext as DataKitContext,
};
