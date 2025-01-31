import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from "react";
import { useAccount } from 'wagmi';
import { getEthersSigner } from '../signer';
import styles from '../styles/Home.module.css';
import { wagmiConfig } from '../wagmi';
import { PrismClient } from '../../sdk';
import Image from 'next/image';

const publisher1 = '0x4efD2760065103225b5f861C165Fe41AC5974AD7';
const publisher2 = '0xc3B17A5a49c00e4e4551B6233F9a11Ed993B9685';
const publisher3 = '0xFa214723917091b78a0624d0953Ec1BD35F723DC';
const publisher = publisher3;
const websiteUrl = 'berachain.com';

const Home: NextPage = () => {
  // init prism SDK

  const { address } = useAccount()
  const [winner, setWinner] = useState<any | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading
  const [error, setError] = useState<any | null>(null);
  const [clickCount, setClickCount] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);
  const [impressionsCounter, setImpressionsCounter] = useState<number>(0);
  const [prismClient, setPrismClient] = useState<PrismClient | null>(null);

  const [bannerSource, setBannerSource] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const prismClient = new PrismClient(publisher, websiteUrl);
    setPrismClient(prismClient);
    if (address && prismClient) {
      setIsLoading(true);
      console.log('triggering auction');
      prismClient.triggerAuction(address).then((winner: any) => {
        setWinner(winner);
        console.log('Winner>>', winner);
      }).catch((error: any) => {
        setError(error);
        console.error('Error triggering auction:', error);
      }).finally(() => {
        setIsLoading(false); // Stop loading
      });
    }
  }, [address]);

  const handleSearch = () => {
    if (inputValue && prismClient) {
      setIsLoading(true); // Start loading
      prismClient.triggerAuction(inputValue).then((winner: any) => {

        setWinner(winner);
        setImpressionsCounter(prevCount => prevCount + 1);

        console.log('Winner>>', winner);
      }).finally(() => {
        setIsLoading(false); // Stop loading
      });
    }
  };

  const handleLinkClick = () => {
    prismClient && prismClient.handleUserClick(winner.campaign_id).then(() => {
      setClickCount(prevCount => prevCount + 1);
    });
  };

  const sendCompletionFeedback = () => {
    console.log('feedback', winner)
    if (winner && winner.id != 'default-campaign') {
      prismClient && prismClient.sendViewedFeedback(winner.campaign_id);
    }
  }

  useEffect(() => {
    if (winner && winner.id != 'default-campaign') {
      setRenderCount(prevCount => prevCount + 1);
    }
  }, [winner]);

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
          Publishers Website
        </h1>
        <ConnectButton />
      </div>

      <main className={styles.main}>


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
            src={bannerSource}
            width={300}
            height={250}
            alt="Banner"
            className={styles.banner}
            onError={(e: any) => {
              e.target.src = bannerSource == '' ? 'https://placehold.co/300x250' : 'https://placehold.co/300x250?text=Invalid+Banner+Image';
            }}
            onLoadingComplete={() => setIsLoading(false)}
          />

        </div>

        <div className={styles.mockContainer}>
          <div className={styles.mock}>

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



          </div>
          <div className={styles.mock}>&nbsp;</div>
          <div className={styles.mock}>&nbsp;</div>
          <div className={styles.mock}>&nbsp;</div>
        </div>

        {isLoading &&
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
          </div>
        }

        <div className={styles.grid}>

          {winner?.banner_ipfs_uri && !isLoading && (
            <a
              className={styles.card}
              href="https://www.berachain.com/"
              target="_blank"
              onClick={handleLinkClick}
            >
              <h2>{winner.campaign_name}</h2>
              <Image
                width={500}
                height={500}
                src={winner.banner_ipfs_uri}
                alt={winner.campaign_name}
                onLoad={() => sendCompletionFeedback()}
              />
            </a>
          )}

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
          <p>Link clicked: {clickCount} times</p>
          <p>Image rendered: {renderCount} times</p>
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