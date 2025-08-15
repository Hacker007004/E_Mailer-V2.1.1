import type { Recipient } from '../types';

// --- Data for random generation ---
const firstNames = ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const streetNames = ["Main St", "Oak Ave", "Pine Ln", "Maple Dr", "Cedar Blvd", "Elm St", "Washington Ave", "Lake Rd", "Hillcrest Dr"];
const cities = ["Springfield", "Fairview", "Riverside", "Madison", "Georgetown", "Franklin", "Clinton"];
const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

// --- Helper functions ---
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomString = (length: number, chars: string): string => Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');

// --- Tag generator functions ---
const getTodayDate = (): string => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
const getTodayDateShort = (): string => new Date().toLocaleDateString('en-US');
const getDateTime = (): string => new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' });
const getFirstName = (): string => getRandom(firstNames);
export const generateRandomName = (type: 'FNAME' | 'NAME' | 'UNAME'): string => {
    const firstName = getFirstName();
    const lastName = getRandom(lastNames);
    if (type === 'FNAME') return `${firstName} ${lastName}`;
    if (type === 'NAME') return firstName;
    const middleInitial = randomString(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    return `${firstName.charAt(0)}. ${middleInitial} ${lastName}`;
};
const getInvoiceNumber = (): string => `INV-${randomString(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}-${randomNum(1000, 9999)}`;
const get6DigitNumber = (): string => randomNum(100000, 999999).toString();
const getLongNumLetters = (): string => randomString(32, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
const getShortMixedLetters = (): string => randomString(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const getLongMixedLetters = (): string => randomString(20, 'abcdefghijklmnopqrstuvwxyz');
const getUUID = (): string => crypto.randomUUID();
const getTrxAddress = (): string => `bc1q${randomString(38, '023456789acdefghjklmnpqrstuvwxyz')}`;
const getStreetAddress = (): string => `${randomNum(1, 2000)} ${getRandom(streetNames)}`;

// --- New implementation for consistent tag replacement ---
export type TagMap = { [key: string]: string };

/**
 * Generates a map of tags to their replacement values for a single email context.
 * It prioritizes data from the recipient object and falls back to random generation.
 */
export const generateTagMap = (recipient: Recipient): TagMap => {
    const tagMap: TagMap = {};
    
    // 1. Populate with custom data from the recipient
    if (recipient.data) {
        for (const [key, value] of Object.entries(recipient.data)) {
            tagMap[`#${key.toUpperCase()}#`] = value;
        }
    }
    
    // 2. Populate with standard, dynamic values
    tagMap['#DATE#'] = getTodayDate();
    tagMap['#DATE1#'] = getTodayDateShort();
    tagMap['#DATETIME#'] = getDateTime();
    tagMap['#EMAIL#'] = recipient.email; // Always use the recipient's actual email

    // 3. Populate with fallbacks for random data if not provided in custom data
    const firstName = getFirstName();
    const lastName = getRandom(lastNames);
    const middleInitial = randomString(1, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const streetAddress = getStreetAddress();
    const fullAddress = `${streetAddress}, ${getRandom(cities)}, ${getRandom(states)} ${randomNum(10000, 99999)}`;

    const fallbacks: TagMap = {
        '#NAME#': firstName,
        '#FNAME#': `${firstName} ${lastName}`,
        '#UNAME#': `${firstName.charAt(0)}. ${middleInitial} ${lastName}`,
        '#INV#': getInvoiceNumber(),
        '#SNUM#': get6DigitNumber(),
        '#LNUM#': getLongNumLetters(),
        '#SMLETT#': getShortMixedLetters(),
        '#LMLETT#': getLongMixedLetters(),
        '#UKEY#': getUUID(),
        '#TRX#': getTrxAddress(),
        '#ADDRESS#': streetAddress,
        '#ADDRESS1#': fullAddress,
    };
    
    for (const [tag, value] of Object.entries(fallbacks)) {
        if (!tagMap[tag]) {
            tagMap[tag] = value;
        }
    }

    return tagMap;
};


/**
 * Replaces all occurrences of tags in a string with values from the provided map.
 */
export const replaceTags = (text: string, tagMap: TagMap): string => {
    if (!text) return '';
    let result = text;
    // Iterate over the tag map and replace each tag globally in the text
    for (const [tag, value] of Object.entries(tagMap)) {
        // Use a RegExp with the 'g' and 'i' flags for global, case-insensitive replacement
        const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, value);
    }
    return result;
};
