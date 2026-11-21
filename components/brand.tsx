import Image from 'next/image';
import Link from 'next/link';
export const Brand = () => (
  <Link href="/" className="brand" aria-label="One More Film home">
    <Image src="/logo.svg" alt="" width={40} height={40} priority />
    <span>One More Film</span>
  </Link>
);
