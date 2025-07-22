"use client";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { PrismClient } from "prism-sdk";
import { usePrismSDK, type PrismWinner } from "prism-sdk/react";


const publisherAddress = '0xFa214723917091b78a0624d0953Ec1BD35F723DC'; // example publisher address
const publisherDomain = 'https://prism-ads-publisher-1.netlify.app'; // example publisher domain

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const Home: NextPage = () => {
  const { address } = useAccount();
  const { init, clicks, impressions } = usePrismSDK({ publisherAddress, publisherDomain });
  const [winner, setWinner] = useState<PrismWinner | null>(null);
  const [bannerSource, setBannerSource] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<LogEntry[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(true);
  const debugBoxRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [autoTrigger, setAutoTrigger] = useState<boolean>(true); // Default for SSR
  useEffect(() => {
    const saved = localStorage.getItem('prism-autotrigger');
    if (saved !== null) {
      setAutoTrigger(JSON.parse(saved));
    }
  }, []);


    const loadAdManually = async () => {
      try {
        addLog('info', 'Manually triggering Prism auction');
        const result = await PrismClient.auction(
          publisherAddress,
          publisherDomain.replace('https://', ''),
          address!
        );
        setWinner(result);
        addLog('success', 'Manual auction successful', result);
      } catch (err) {
        addLog('error', 'Manual auction failed', err);
      }
    };

    useEffect(() => {
      if (!mounted || autoTrigger || !address || winner) return;
      loadAdManually();
    }, [autoTrigger, address, mounted]);



  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setDebugLogs(prev => [...prev, newLog]);
    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (debugBoxRef.current) {
        debugBoxRef.current.scrollTop = debugBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addLog('info', 'Debug logs cleared');
  };


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    addLog('info', 'SDK configuration changed', { 
      address: address || 'Not connected', 
      walletConnected: !!address,
      autoTrigger 
    });
    addLog('info', 'Initializing Prism SDK', {
      publisherAddress,
      publisherDomain: publisherDomain.replace('https://', ''),
      connectedWallet: address,
      autoTrigger
    });

    init({
      autoTrigger,
        getWalletAddress: () => address,
        walletDetectionTimeout: 2000,
        onSuccess: (winner) => {
          addLog('success', 'Ad winner received', {
            campaignId: winner.campaignId,
            campaignName: winner.campaignName,
            bannerIpfsUri: winner.bannerIpfsUri
          });
          setWinner(winner);
        },
        onError: (error) => {
          addLog('error', 'Ad load failed', error);
        }
    })
    
  }, [autoTrigger, address, mounted]);

  const handleAdClick = (winner: PrismWinner) => {
    addLog('info', 'Ad clicked - tracking click event', {
      campaignId: winner.campaignId,
      url: winner.url
    });
    
      clicks(winner.campaignId, winner.jwt_token, {
        onSuccess: () => {
          addLog('success', 'Click event tracked successfully', {
            campaignId: winner.campaignId,
            url: winner.url
          });
        },
        onError: (error) => {
          addLog('error', 'Failed to track click event', error);
        }
      })
      window.open(winner.url, '_blank');
  };


  return (
    <main className={styles.container}>
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
          Prism Publisher Demo
        </h1>
        <ConnectButton />
      </div>

      <div className={styles.configSection}>
        <h2>Configuration</h2>
        <div className={styles.configGrid}>
          <div className={styles.configItem}>
            <strong>Publisher Address:</strong>
            <span>{publisherAddress}</span>
          </div>
          <div className={styles.configItem}>
            <strong>Publisher Domain:</strong>
            <span>{publisherDomain}</span>
          </div>
          <div className={styles.configItem}>
            <strong>Connected Wallet:</strong>
            <span>{mounted ? (address || 'Not connected') : 'Loading...'}</span>
          </div>
          <div className={styles.configItem}>
            <strong>Auto Trigger:</strong>
            <div className={styles.toggleContainer}>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={autoTrigger}
                  onChange={(e) => {
                    setAutoTrigger(e.target.checked);
                    localStorage.setItem('prism-autotrigger', JSON.stringify(e.target.checked));
                    addLog('info', `Auto trigger ${e.target.checked ? 'enabled' : 'disabled'}`, {
                      autoTrigger: e.target.checked
                    });
                  }}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.toggleStatus}>
                {autoTrigger ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.configExplanation}>
          <h3>Auto Trigger Explanation</h3>
          <p>
            <strong>Auto Trigger</strong> controls when the Prism SDK requests advertisements and affects wallet connection behavior:
          </p>
          <ul>
            <li><strong>Enabled:</strong> Shows ads immediately for both connected and unconnected users when the SDK initializes</li>
            <li><strong>Disabled:</strong> Prevents automatic ad loading - useful when you want to show ads only after users connect their wallets</li>
          </ul>
          <p>
            <strong>Use Case:</strong> Disable autoTrigger if you want to control ad visibility based on wallet connection status. 
            Some publishers prefer not to show ads to unconnected users and only display them after wallet connection.
          </p>
          <p>
            When disabled, call <code>PrismClient.auction()</code> manually when you want to load ads 
            (e.g., after wallet connection or other user interactions).
          </p>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.contentGrid}>
          <div className={styles.adSection}>
            <h2>Live Advertisement</h2>
            {winner && winner.bannerIpfsUri ? (
              <div 
                className={styles.adCard}
                onClick={() => handleAdClick(winner)}
              >
                <h3>{winner.campaignName}</h3>
                <div className={styles.adImageContainer}>
                  <Image
                    width={500}
                    height={500}
                    src={winner.bannerIpfsUri}
                    alt={winner.campaignName}
                    className={styles.adImage}
                    onLoad={() => {
                      addLog('info', 'Ad image loaded - tracking impression', {
                        campaignId: winner.campaignId
                      });
                        impressions(winner.campaignId, winner.jwt_token,  {
                          onSuccess: () => {
                            addLog('success', 'Impression tracked successfully', {
                              campaignId: winner.campaignId
                            });
                          },
                          onError: (error) => {
                            addLog('error', 'Failed to track impression', error);
                          }
                        })
                    }}
                    onError={() => {
                      addLog('error', 'Failed to load ad image');
                    }}
                  />
                </div>
                <p className={styles.clickHint}>Click to visit advertiser</p>
              </div>
            ) : (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading advertisements...</p>
              </div>
            )}
          </div>

          <div className={styles.debugSection}>
            <div className={styles.debugHeader}>
              <h2>Debug Console</h2>
              <div className={styles.debugControls}>
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className={styles.toggleButton}
                >
                  {showDebug ? 'Hide' : 'Show'}
                </button>
                <button 
                  onClick={clearLogs}
                  className={styles.clearButton}
                >
                  Clear
                </button>
              </div>
            </div>
            {showDebug && (
              <div 
                ref={debugBoxRef}
                className={styles.debugBox}
              >
                {debugLogs.length === 0 ? (
                  <div className={styles.noLogs}>No debug logs yet...</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className={`${styles.logEntry} ${styles[log.type]}`}>
                      <span className={styles.timestamp}>{log.timestamp}</span>
                      <span className={styles.logType}>[{log.type.toUpperCase()}]</span>
                      <span className={styles.logMessage}>{log.message}</span>
                      {log.data && (
                        <pre className={styles.logData}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>



        <div className={styles.testSection}>
          <h2>Banner Test Tool</h2>
          <p className={styles.testDescription}>
            Test your advertising image (recommended: 300 x 250 pixels)
          </p>
          <div className={styles.testContainer}>
            <div className={styles.testControls}>
              <input
                type="text"
                value={bannerSource}
                onChange={(e) => {
                  setBannerSource(e.target.value);
                  addLog('info', 'Banner URL updated', { url: e.target.value });
                }}
                className={styles.testInput}
                placeholder="Enter Banner URL to test"
              />
            </div>
            <div className={styles.testPreview}>
              <Image
                src={bannerSource || 'https://placehold.co/300x250'}
                width={300}
                height={250}
                alt="Banner Preview"
                className={styles.testBanner}
                onError={(e: any) => {
                  const errorSrc = bannerSource === '' 
                    ? 'https://placehold.co/300x250' 
                    : 'https://placehold.co/300x250?text=Invalid+Banner+Image';
                  e.target.src = errorSrc;
                  addLog('warning', 'Banner image failed to load', { url: bannerSource });
                }}
                onLoad={() => {
                  if (bannerSource) {
                    addLog('success', 'Banner image loaded successfully', { url: bannerSource });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;