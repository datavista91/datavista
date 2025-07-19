'use client'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export const FlipWords = ({
   words,
   duration = 3000,
   className,
}: {
   words: string[]
   duration?: number
   className?: string
}) => {
   const [currentWord, setCurrentWord] = useState(words[0])
   const [isAnimating, setIsAnimating] = useState<boolean>(false)

   const startAnimation = useCallback(() => {
      const word = words[words.indexOf(currentWord) + 1] || words[0]
      setCurrentWord(word)
      setIsAnimating(true)
   }, [currentWord, words])

   useEffect(() => {
      if (!isAnimating)
         setTimeout(() => {
            startAnimation()
         }, duration)
   }, [isAnimating, duration, startAnimation])

   return (
      <AnimatePresence
         onExitComplete={() => {
            setIsAnimating(false)
         }}
      >
         <motion.div
            initial={{
               opacity: 0,
               y: 10,
            }}
            animate={{
               opacity: 1,
               y: 0,
            }}
            transition={{
               type: 'spring',
               stiffness: 100,
               damping: 10,
            }}
            exit={{
               opacity: 0,
               y: -15,
               filter: 'blur(2px)',
               scale: 1,
               position: 'absolute',
            }}
            className={`z-10 inline-block relative text-left px-2 ${className || ''}`}
            key={currentWord}
         >
            {currentWord.split(' ').map((word, wordIndex) => (
               <motion.span
                  key={word + wordIndex}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                     delay: wordIndex * 0.2,
                     duration: 0.4,
                  }}
                  className='inline-block whitespace-nowrap'
               >
                  {word.split('').map((letter, letterIndex) => (
                     <motion.span
                        key={word + letterIndex}
                        initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                           delay: wordIndex * 0.2 + letterIndex * 0.03,
                           duration: 0.3,
                        }}
                        className='inline-block'
                     >
                        {letter}
                     </motion.span>
                  ))}
                  <span className='inline-block'>&nbsp;</span>
               </motion.span>
            ))}
         </motion.div>
      </AnimatePresence>
   )
}
