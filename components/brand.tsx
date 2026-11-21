import Image from 'next/image';
import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { routes } from '@/lib/links';
export const Brand = () => (
  <Link href={routes.home} className="brand" aria-label={`${BRAND_NAME} home`}>
    <Image src="/logo.svg" alt="" width={40} height={40} priority />
    <span>{BRAND_NAME}</span>
  </Link>
);
