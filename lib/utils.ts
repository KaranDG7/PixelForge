/* eslint-disable prefer-const */
/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

/**
 * Combines multiple class names into one string, merging Tailwind classes.
 * @param inputs - An array of class names or objects representing class names.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER

/**
 * Handles errors by logging them and throwing a new error with a message.
 * @param error - The error to handle.
 * @throws A new error with a descriptive message.
 */
export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// PLACEHOLDER LOADER - while image is transforming

/**
 * Generates a shimmer SVG for placeholder loading.
 * @param w - Width of the SVG.
 * @param h - Height of the SVG.
 * @returns A string containing SVG markup.
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

/**
 * Converts a string to a Base64-encoded string.
 * @param str - The string to encode.
 * @returns The Base64-encoded string.
 */
const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl: string = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;

// ==== End

// Define Interfaces for Query Parameters

/**
 * Parameters for forming a URL query.
 */
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string;
}

/**
 * Parameters for removing keys from a URL query.
 */
interface RemoveUrlQueryParams {
  searchParams: string;
  keysToRemove: string[];
}

// FORM URL QUERY

/**
 * Forms a new URL with updated query parameters.
 * @param params - An object containing searchParams, key, and value.
 * @returns A string representing the new URL with updated query parameters.
 */
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

// REMOVE KEY FROM QUERY

/**
 * Removes specified keys from the current URL's query parameters.
 * @param params - An object containing searchParams and keysToRemove.
 * @returns A string representing the new URL without the specified query parameters.
 */
export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // Remove null or undefined values
  Object.keys(currentUrl).forEach(
    (key) => currentUrl[key] == null && delete currentUrl[key]
  );

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

// DEBOUNCE

/**
 * Creates a debounced version of the provided function.
 * @param func - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced function.
 */
export const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null;

  return (...args: Parameters<F>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// GE IMAGE SIZE

/**
 * Defines the keys for aspect ratio options.
 */
export type AspectRatioKey = keyof typeof aspectRatioOptions;

/**
 * Represents an image with an aspect ratio.
 */
interface ImageWithAspectRatio {
  aspectRatio: AspectRatioKey;
  width?: number;
  height?: number;
}

/**
 * Retrieves the image size based on the type and dimension.
 * @param type - The type of image sizing (e.g., "fill").
 * @param image - The image object containing aspect ratio and dimensions.
 * @param dimension - The dimension to retrieve ("width" or "height").
 * @returns The size of the image for the specified dimension.
 */
export const getImageSize = (
  type: string,
  image: ImageWithAspectRatio,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio]?.[dimension] || 1000
    );
  }
  return image?.[dimension] || 1000;
};

// DOWNLOAD IMAGE

/**
 * Downloads an image from the specified URL with the given filename.
 * @param url - The URL of the image to download.
 * @param filename - The desired filename for the downloaded image.
 * @throws An error if the URL is not provided.
 */
export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${response.statusText}`);
      }
      return response.blob();
    })
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.trim().length) {
        a.download = `${filename.replace(/\s+/g, "_")}.png`;
      }
      document.body.appendChild(a);
      a.click();
      // Clean up
      a.remove();
      URL.revokeObjectURL(blobURL);
    })
    .catch((error) => console.error({ error }));
};

// DEEP MERGE OBJECTS

/**
 * Deeply merges two objects.
 * @param obj1 - The first object.
 * @param obj2 - The second object to merge into the first.
 * @returns The merged object.
 */
export const deepMergeObjects = <T extends Record<string, any>, U extends Record<string, any>>(
  obj1: T,
  obj2: U
): T & U => {
  if (obj2 === null || obj2 === undefined) {
    return obj1 as T & U;
  }

  const output = { ...obj2 } as T & U;

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (
        obj1[key] &&
        typeof obj1[key] === "object" &&
        obj2[key] &&
        typeof obj2[key] === "object"
      ) {
        (output as any)[key] = deepMergeObjects(obj1[key], obj2[key]);
      } else {
        (output as any)[key] = obj1[key];
      }
    }
  }

  return output;
};
