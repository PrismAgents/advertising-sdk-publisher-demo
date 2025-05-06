import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState, useRef } from "react";
import { useAccount } from 'wagmi';
import { getEthersSigner } from '../signer';
import styles from '../styles/Home.module.css';
import { wagmiConfig } from '../wagmi';
import axios from 'axios';
import Image from 'next/image';
import { PrismClient ,PrismWinner} from 'prism-sdk';


const publisherAddress = '0xFa214723917091b78a0624d0953Ec1BD35F723DC'; // example publisher address
const publisherDomain = 'https://prism-ads-publisher-1.netlify.app'; // example publisher domain

const Home: NextPage = () => {
  const { address } = useAccount()
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading
  const [error, setError] = useState<any | null>(null);
  const [clickCount, setClickCount] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);
  const [impressionsCounter, setImpressionsCounter] = useState<number>(0);
  const [bannerSource, setBannerSource] = useState<string>('');
  const prevAddressRef = useRef<string | undefined>(undefined);
  const [prismWinner, setPrismWinner] = useState<PrismWinner>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (address !== prevAddressRef.current) {
      setIsLoading(true);
      const fetchData = async () => {
        if (address) {
          const winner : PrismWinner = await PrismClient.auction(
            publisherAddress,
            publisherDomain,
            address
          );
          console.log('winner', winner);
          setPrismWinner(winner);
        }
        setIsLoading(false);
      };
      fetchData();
      prevAddressRef.current = address;
    }

  }, [address]);

  const handleClicks = () => {
      if (address && prismWinner) PrismClient.clicks(
        address,
        publisherDomain,
        prismWinner.campaignId,
        prismWinner.jwt_token
      )
      .then(() =>
        setClickCount((prevCount: number) => prevCount + 1)
      );
  }

  const handleImpressions = () => {

    if (address && prismWinner) PrismClient.impressions(
      publisherAddress,
      publisherDomain,
      prismWinner.campaignId,
      prismWinner.jwt_token
    )
  }

  useEffect(() => {
    if (prismWinner) {
      setRenderCount(prevCount => prevCount + 1);
    }
  }, [prismWinner]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Prism Client</title>
        <meta
          content="Prism Client"
          name="prism sdk testing client publisher"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className={styles.navbar}>
        <h1 className={styles.title}>
          Publisher's Website
        </h1>
        <ConnectButton />
      </div>

      <div  style={{textAlign: 'left', fontSize: '1.5rem'}}>

         <p><b >Publisher:</b> {process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS}</p>
         <p><b >Publisher Domain:</b> {process.env.NEXT_PUBLIC_PUBLISHER_DOMAIN}</p>

      </div>

      <main className={styles.main}>




        {/* <div className={styles.mockContainer}>
          <div className={styles.mock}></div>
           <div className={styles.mock}>&nbsp;</div>
          <div className={styles.mock}>&nbsp;</div>
          <div className={styles.mock}>&nbsp;</div>
        </div> */}



        {/* <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange} // Add this line
            className={styles.inputField}
            placeholder="Enter wallet address"
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div> */}

        {prismWinner?.bannerIpfsUri && !isLoading && (
          <a
            className={styles.card}
            href={prismWinner.url}
            target="_blank"
            onClick={handleClicks}
          >
            <h2>{prismWinner.campaignName}</h2>
            <Image
              width={500}
              height={500}
              src={prismWinner.bannerIpfsUri || 'https://placehold.co/300x250'}
              alt={prismWinner.campaignName}
              onLoad={() => handleImpressions()}
            />
          </a>
        )}

        {isLoading &&
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
          </div>
        }

        <div className={styles.grid}>


          {/* <a
                className={styles.card}
                href="http://13.58.91.209:3000/"
              >
                <h2>Prism API Docs &rarr;</h2>
                <p>
                  Swagger API Docs for Prism API
                </p>
              </a> */}
        </div>


        <div>
          {/* <p>Link clicked: {clickCount} times</p>
          <p>Image rendered: {renderCount} times</p> */}
        </div>

        <div className={styles.bannerContainer}>
          <div>


            <p className={styles.description}>
              Test your advertising image of dimensions 300 x 250 pixels<br></br>
              paste the url of the banner image below.
            </p>


            <div className={styles.inputContainer}>
              <input
                type="text"
                value={bannerSource}
                onChange={(e) => setBannerSource(e.target.value)}
                className={styles.inputField}
                placeholder="Enter Banner URL"
              />
            </div>
            {/* <button onClick={(e:any) => setBannerSource(e.target.value)} className={styles.searchButton}>
                Search
              </button> */}
          </div>
          <Image
            src={bannerSource || 'https://placehold.co/300x250'}
            width={300}
            height={250}
            alt="Banner"
            className={styles.banner}
            onError={(e: any) => {
              e.target.src = bannerSource == '' ? 'https://placehold.co/300x250' : 'https://placehold.co/300x250?text=Invalid+Banner+Image';
            }}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ⚡ by your frens at Hype
        </a>
      </footer>
    </div>
  );
};

export default Home;