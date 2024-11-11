import React, { forwardRef } from 'react';
import { Popover as RadixPopover, PopoverTrigger as RadixPopoverTrigger, PopoverContent as RadixPopoverContent } from "@radix-ui/react-popover";

export const Popover = forwardRef((props, ref) => (
  <RadixPopover {...props} ref={ref} />
));

export const PopoverTrigger = forwardRef((props, ref) => (
  <RadixPopoverTrigger {...props} ref={ref} />
));

export const PopoverContent = forwardRef((props, ref) => (
  <RadixPopoverContent {...props} ref={ref} />
));