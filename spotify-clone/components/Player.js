import React, { useState, useEffect, useCallback } from 'react';
import useSpotify from '../hooks/useSpotify';
import useSongInfo from '../hooks/useSongInfo';
import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom';
import { debounce } from 'lodash';
import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline';
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  RewindIcon,
  VolumeUpIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react/solid';

function Player() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentIdTrack] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState();

  const songInfo = useSongInfo();

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentIdTrack(data.body?.item?.id);

        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      // fetch song info
      fetchCurrentSong();
      setVolume(50);
    }
  }, [currentTrackIdState, spotifyApi, session]);

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debounceAdjustVolume(volume);
    }
  }, [volume]);

  const debounceAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {});
    }, 500),
    []
  );

  return (
    <div className='grid h-24 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base'>
      {/* left portion */}
      <div className='flex items-center space-x-4'>
        <img
          className='hidden h-10 w-10 md:inline'
          src={songInfo?.album.images?.[0]?.url}
          alt=''
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>
      {/* center portion */}
      <div className='flex items-center justify-evenly'>
        <SwitchHorizontalIcon className='button' />
        <RewindIcon
          // onClick={()=> spotifyApi.skipToPrevious()}
          className='button'
        />

        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className='button h-10 w-10' />
        ) : (
          <PlayIcon onClick={handlePlayPause} className='button h-10 w-10' />
        )}

        <FastForwardIcon
          //onClick={()=>{spotifyApi.skipToNext()}}
          className='button'
        />

        <ReplyIcon className='button' />
      </div>

      {/* right portion */}
      <div className='flex items-center justify-end space-x-3 pr-5 md:space-x-4'>
        <VolumeDownIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className='button'
        />
        <input
          className='w-14 md:w-28'
          type='range'
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          max={100}
        />
        <VolumeUpIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className='button'
        />
      </div>
    </div>
  );
}

export default Player;
