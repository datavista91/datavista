// public/workers/analysisWorker.js
class DataAnalyzer {
   constructor() {
      this.progressCallback = null
   }

   setProgressCallback(callback) {
      this.progressCallback = callback
   }

   updateProgress(step, total) {
      if (this.progressCallback) {
         const progress = Math.round((step / total) * 100)
         this.progressCallback(progress)
      }
   }

   // Step 1: Create Smart Sample
   createSmartSample(data, sampleSize = 1000) {
      this.updateProgress(1, 5)

      if (!data || data.length === 0) return []
      if (data.length <= sampleSize) return data

      // Try stratified sampling first
      const categoricalColumn = this.findBestCategoricalColumn(data)

      if (categoricalColumn) {
         return this.stratifiedSample(data, categoricalColumn, sampleSize)
      } else {
         // Try time-based sampling if date column exists
         const dateColumn = this.findDateColumn(data)
         if (dateColumn) {
            return this.timeSample(data, dateColumn, sampleSize)
         } else {
            // Random sampling as fallback
            return this.randomSample(data, sampleSize)
         }
      }
   }

   stratifiedSample(data, column, sampleSize) {
      const groups = {}

      // Group by column value
      data.forEach((row) => {
         const value = row[column]
         if (!groups[value]) groups[value] = []
         groups[value].push(row)
      })

      const sample = []
      const groupNames = Object.keys(groups)

      groupNames.forEach((groupName) => {
         const groupData = groups[groupName]
         const groupSampleSize = Math.floor((groupData.length / data.length) * sampleSize)

         if (groupSampleSize > 0) {
            // Random sample from this group
            const shuffled = [...groupData].sort(() => 0.5 - Math.random())
            sample.push(...shuffled.slice(0, Math.min(groupSampleSize, groupData.length)))
         }
      })

      // If we don't have enough samples, fill with random selection
      if (sample.length < sampleSize) {
         const remaining = sampleSize - sample.length
         const unusedData = data.filter((row) => !sample.includes(row))
         const additionalSample = this.randomSample(unusedData, remaining)
         sample.push(...additionalSample)
      }

      return sample.slice(0, sampleSize) // Ensure we don't exceed sample size
   }

   findBestCategoricalColumn(data) {
      if (!data.length) return null

      const columns = Object.keys(data[0])
      let bestColumn = null
      let bestScore = 0

      columns.forEach((col) => {
         const values = data
            .slice(0, 1000)
            .map((row) => row[col])
            .filter((v) => v != null && v !== '') // Check first 1000 rows
         const uniqueValues = new Set(values)
         const uniqueRatio = uniqueValues.size / values.length

         // Good categorical column: 2-20 unique values, not too many, not too few
         if (uniqueValues.size >= 2 && uniqueValues.size <= 20 && uniqueRatio < 0.5) {
            const score = 1 - uniqueRatio // Lower ratio = better for stratification
            if (score > bestScore) {
               bestScore = score
               bestColumn = col
            }
         }
      })

      return bestColumn
   }

   findDateColumn(data) {
      if (!data.length) return null

      const columns = Object.keys(data[0])

      for (const col of columns) {
         if (this.isDateColumn(data.slice(0, 100).map((row) => row[col]))) {
            return col
         }
      }

      return null
   }

   timeSample(data, dateColumn, sampleSize) {
      // Sort by date
      const sortedData = [...data].sort((a, b) => {
         const dateA = new Date(a[dateColumn])
         const dateB = new Date(b[dateColumn])
         return dateA - dateB
      })

      // Take evenly spaced samples across time range
      const step = Math.floor(sortedData.length / sampleSize)
      const sample = []

      for (let i = 0; i < sortedData.length && sample.length < sampleSize; i += step) {
         sample.push(sortedData[i])
      }

      return sample
   }

   randomSample(data, sampleSize) {
      if (!data || data.length === 0) return []
      const shuffled = [...data].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, Math.min(sampleSize, data.length))
   }

   // Step 2: Create Summary Statistics
   createSummary(sample, fullData) {
      this.updateProgress(2, 5)

      if (!fullData || fullData.length === 0) {
         return this.getEmptySummary()
      }

      const columns = Object.keys(fullData[0] || {})

      const summary = {
         overview: {
            totalRows: fullData.length,
            totalColumns: columns.length,
            columns: columns,
            sampleSize: sample.length,
         },
         statistics: {},
         patterns: {
            correlations: {},
            trends: [],
            outliers: [],
         },
         dataQuality: {
            missingValues: {},
            duplicates: 0,
            dataTypes: {},
         },
      }

      // Calculate statistics on sample (faster)
      this.updateProgress(3, 5)
      summary.statistics = this.calculateColumnStatistics(sample)

      // Calculate correlations on sample
      this.updateProgress(4, 5)
      summary.patterns.correlations = this.calculateCorrelations(sample)

      // Data quality on full dataset (fast aggregations)
      this.updateProgress(5, 5)
      summary.dataQuality = this.assessDataQuality(fullData)

      return summary
   }

   getEmptySummary() {
      return {
         overview: {
            totalRows: 0,
            totalColumns: 0,
            columns: [],
            sampleSize: 0,
         },
         statistics: {},
         patterns: {
            correlations: {},
            trends: [],
            outliers: [],
         },
         dataQuality: {
            missingValues: {},
            duplicates: 0,
            dataTypes: {},
         },
      }
   }

   calculateColumnStatistics(data) {
      if (!data || data.length === 0) return {}

      const columns = Object.keys(data[0] || {})
      const stats = {}

      columns.forEach((col) => {
         const values = data.map((row) => row[col]).filter((v) => v != null && v !== '')
         const numericValues = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v))

         if (numericValues.length > values.length * 0.7) {
            // Numeric column
            stats[col] = {
               type: 'numeric',
               count: numericValues.length,
               mean: this.mean(numericValues),
               median: this.median(numericValues),
               min: Math.min(...numericValues),
               max: Math.max(...numericValues),
               stdDev: this.standardDeviation(numericValues),
               quartiles: this.quartiles(numericValues),
            }
         } else {
            // Categorical column
            const frequencies = this.getFrequencies(values)
            stats[col] = {
               type: 'categorical',
               count: values.length,
               unique: Object.keys(frequencies).length,
               topValues: Object.entries(frequencies)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10),
            }
         }
      })

      return stats
   }

   calculateCorrelations(data) {
      if (!data || data.length < 2) return {}

      const numericColumns = this.getNumericColumns(data)
      const correlations = {}

      for (let i = 0; i < numericColumns.length; i++) {
         for (let j = i + 1; j < numericColumns.length; j++) {
            const col1 = numericColumns[i]
            const col2 = numericColumns[j]
            const correlation = this.pearsonCorrelation(data, col1, col2)

            if (Math.abs(correlation) > 0.3 && !isNaN(correlation)) {
               correlations[`${col1}_${col2}`] = Math.round(correlation * 1000) / 1000
            }
         }
      }

      return correlations
   }

   // Helper methods
   mean(values) {
      if (!values || values.length === 0) return 0
      return values.reduce((a, b) => a + b, 0) / values.length
   }

   median(values) {
      if (!values || values.length === 0) return 0
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
   }

   standardDeviation(values) {
      if (!values || values.length === 0) return 0
      const avg = this.mean(values)
      const squareDiffs = values.map((value) => Math.pow(value - avg, 2))
      return Math.sqrt(this.mean(squareDiffs))
   }

   quartiles(values) {
      if (!values || values.length === 0) return [0, 0, 0]
      const sorted = [...values].sort((a, b) => a - b)
      const q1 = this.median(sorted.slice(0, Math.floor(sorted.length / 2)))
      const q2 = this.median(sorted)
      const q3 = this.median(sorted.slice(Math.ceil(sorted.length / 2)))
      return [q1, q2, q3]
   }

   pearsonCorrelation(data, col1, col2) {
      const pairs = data
         .map((row) => [parseFloat(row[col1]), parseFloat(row[col2])])
         .filter(([a, b]) => !isNaN(a) && !isNaN(b))

      if (pairs.length < 2) return 0

      const n = pairs.length
      const sum1 = pairs.reduce((sum, [a]) => sum + a, 0)
      const sum2 = pairs.reduce((sum, [, b]) => sum + b, 0)
      const sum1Sq = pairs.reduce((sum, [a]) => sum + a * a, 0)
      const sum2Sq = pairs.reduce((sum, [, b]) => sum + b * b, 0)
      const pSum = pairs.reduce((sum, [a, b]) => sum + a * b, 0)

      const num = pSum - (sum1 * sum2) / n
      const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n))

      return den === 0 ? 0 : num / den
   }

   getNumericColumns(data) {
      if (!data || data.length === 0) return []

      const columns = Object.keys(data[0])
      return columns.filter((col) => {
         const values = data.slice(0, 100).map((row) => row[col]) // Check first 100 rows
         const numericValues = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v))
         return numericValues.length > values.length * 0.7
      })
   }

   getFrequencies(values) {
      const freq = {}
      values.forEach((value) => {
         freq[value] = (freq[value] || 0) + 1
      })
      return freq
   }

   assessDataQuality(data) {
      if (!data || data.length === 0) return { missingValues: {}, duplicates: 0, dataTypes: {} }

      const columns = Object.keys(data[0] || {})
      const missingValues = {}
      const dataTypes = {}

      columns.forEach((col) => {
         const values = data.map((row) => row[col])
         const nullCount = values.filter((v) => v == null || v === '').length
         missingValues[col] = nullCount

         // Determine data type
         const nonNullValues = values.filter((v) => v != null && v !== '')
         if (nonNullValues.length === 0) {
            dataTypes[col] = 'empty'
         } else {
            const numericValues = nonNullValues.map((v) => parseFloat(v)).filter((v) => !isNaN(v))

            if (numericValues.length > nonNullValues.length * 0.7) {
               dataTypes[col] = 'numeric'
            } else if (this.isDateColumn(nonNullValues.slice(0, 100))) {
               dataTypes[col] = 'date'
            } else {
               dataTypes[col] = 'categorical'
            }
         }
      })

      return {
         missingValues,
         duplicates: this.countDuplicates(data.slice(0, 1000)), // Check first 1000 rows for performance
         dataTypes,
      }
   }

   countDuplicates(data) {
      if (!data || data.length === 0) return 0

      const seen = new Set()
      let duplicates = 0

      data.forEach((row) => {
         const key = JSON.stringify(row)
         if (seen.has(key)) {
            duplicates++
         } else {
            seen.add(key)
         }
      })

      return duplicates
   }

   isDateColumn(values) {
      if (!values || values.length === 0) return false

      const sampleValues = values.slice(0, 10)
      const dateValues = sampleValues.filter((v) => {
         const parsed = Date.parse(v)
         return !isNaN(parsed)
      })
      return dateValues.length > sampleValues.length * 0.7
   }
}

// Worker message handling
self.onmessage = function (event) {
   const { csvData } = event.data

   const analyzer = new DataAnalyzer()

   // Set up progress callback
   analyzer.setProgressCallback((progress) => {
      self.postMessage({
         type: 'PROGRESS',
         progress: progress,
      })
   })

   try {
      // Step 1: Create sample
      const sample = analyzer.createSmartSample(csvData, 1000)

      // Step 2: Create summary
      const summary = analyzer.createSummary(sample, csvData)

      // Send results
      self.postMessage({
         type: 'COMPLETE',
         data: { sample, summary },
      })
   } catch (error) {
      console.error('Analysis error:', error)
      self.postMessage({
         type: 'ERROR',
         error: error.message,
      })
   }
}
