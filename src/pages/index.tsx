import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { PrismClient, PrismWinner } from 'prism-sdk';


const publisherAddress = '0xFa214723917091b78a0624d0953Ec1BD35F723DC'; // example publisher address
const publisherDomain = 'https://prism-ads-publisher-1.netlify.app'; // example publisher domain

const Home: NextPage = () => {
  const { address } = useAccount();
  const [winner, setWinner] = useState<PrismWinner | null>(null);
  const [bannerSource, setBannerSource] = useState<string>('');


  useEffect(() => {
    console.log('Connected wallet address:', address);
    console.log('Address type:', typeof address);
    
    PrismClient.init(
      publisherAddress,
      publisherDomain.replace('https://', ''),
      {
        connectedWallet: address, // Works even if undefined
        onSuccess: (winner) => {
          console.log('Winner received:', winner);
          setWinner(winner);
        },
        onError: (error) => console.error('Ad load failed:', error)
      }
    );
  }, [address]);

  const handleAdClick = (winner: PrismWinner) => {
    PrismClient.clicks(
      publisherAddress,
      winner.url,
      winner.campaignId,
      winner.jwt_token
    );
    window.open(winner.url, '_blank');
  };


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



        {winner && winner.bannerIpfsUri ? (
          <div 
            className={styles.card}
            onClick={() => handleAdClick(winner)}
          >
            <h2>{winner.campaignName}</h2>
            <Image
              width={500}
              height={500}
              src={winner.bannerIpfsUri}
              alt={winner.campaignName}
              onLoad={() => {
                PrismClient.impressions(
                  publisherAddress,
                  publisherDomain,
                  winner.campaignId,
                  winner.jwt_token,
                  {
                    onError: (error) => console.error('Failed to track impression:', error.message)
                  }
                );
              }}
              onError={() => {
                console.error('Failed to load ad image');
              }}
            />
          </div>
        ) : (
          <div>Loading ads...</div>
        )}

        <div className={styles.grid}>
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
            onLoad={() => {}}
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