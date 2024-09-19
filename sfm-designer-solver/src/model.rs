use std::ops::{Deref, Range};

use itertools::structs::Combinations;
use itertools::Itertools;

use crate::int_set::{IntMultiset, IntSet};

/// Normalized lengths in an interferometer.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub(crate) struct Lengths {
    /// The normalized lengths of the axes are stored as a vector but treated with set semantics.
    lengths: IntSet,

    /// The number of axes in the interferometer.
    axes: usize,

    /// The normalized OPDs in the interferometer.
    opds: IntMultiset,

    /// Whether the interferometer is totally demodulatable, meaning that all OPDs are unique.
    is_demodulatable: bool,
}

impl Lengths {
    /// Create a new bands with the given normalized lengths.
    pub(crate) fn from(lengths: IntSet) -> Self {
        let axes = {
            let n = lengths.len();
            n * (n - 1) / 2
        };
        let opds = {
            // This is more efficient than Itertools::cartesian_product because
            // it only allocates once.
            let mut opds = Vec::with_capacity(axes);
            for i in 0..lengths.len() {
                for j in (i + 1)..lengths.len() {
                    opds.push(lengths[i].abs_diff(lengths[j]));
                }
            }
            IntMultiset::from(opds)
        };
        let is_demodulatable = opds.is_set();

        Self {
            lengths,
            axes,
            opds,
            is_demodulatable,
        }
    }

    /// The normalized lengths of the axes are stored as a vector but treated with set semantics.
    pub(crate) fn lengths(&self) -> &IntSet {
        &self.lengths
    }
}

/// An iterator of [`Lengths`] to simulate.
#[derive(Clone, Debug)]
struct Cases {
    /// An iterator over the combinations.
    cases: Combinations<Range<usize>>,

    /// The number of lengths in the interferometer.
    size: usize,

    /// The largest normalized length in the text cases.
    largest: usize,

    /// An escape hatch used to exit the iterator early when the size is 2.
    escaped: bool,
}

impl Cases {
    /// Generate simulation [`Lengths`] of a given `size` which contains all valid [`Lengths`] that
    /// include 0 and `largest`.
    pub(crate) fn up_to(size: usize, largest: usize) -> Self {
        assert!(size >= 2);
        assert!(largest >= size - 1);
        Self {
            // 2 less than the size are generated. This is because the case should always include
            // the smallest (0) and the largest normalized lengths. The middle values are generated
            // and the 0 and largest are appended before returning the case.
            cases: (1..largest).combinations(size - 2),
            size,
            largest,
            escaped: false,
        }
    }
}

impl Iterator for Cases {
    type Item = Lengths;

    fn next(&mut self) -> Option<Self::Item> {
        // This is an escape hatch to inject the correct iterator when the size is 2. The
        // combinations cannot capture this.
        if self.size == 2 && self.largest == 1 {
            return if !self.escaped {
                self.escaped = true;
                Some(Lengths::from(IntSet::from(vec![0, self.largest])))
            } else {
                None
            };
        }
        // The default for when size is 3 or more.
        self.cases.next().map(|mut case| {
            case.push(0);
            case.push(self.largest);
            Lengths::from(IntSet::from(case))
        })
    }
}

/// An iterator over the solutions for an interferometer.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub(crate) struct Solutions(Vec<Lengths>);

impl Solutions {
    /// Find all solutions for an interferometer of a given `size` (which is the
    /// number of lengths) starting at the given maximum length.
    ///
    /// The allowed lengths are incremented until one or more solutions are
    /// found for that length. All solutions for the first length that has one
    /// are placed on the iterator.
    pub(crate) fn find_starting_at(size: usize, largest: usize) -> Self {
        let mut offset = 0;
        loop {
            let cases = Cases::up_to(size, largest + offset);
            let solutions: Vec<Lengths> = cases
                .filter_map(|lengths| lengths.is_demodulatable.then_some(lengths))
                .collect();
            if !solutions.is_empty() {
                return Self(solutions);
            }
            offset += 1;
        }
    }
}

impl Deref for Solutions {
    type Target = [Lengths];
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lengths_to_vec(lengths: &Lengths) -> Vec<usize> {
        lengths.lengths.iter().map(|x| *x).collect::<Vec<_>>()
    }

    #[test]
    fn lengths_from_is_demodulatable() {
        let lengths = Lengths::from(IntSet::from(vec![0, 1, 3]));
        assert_eq!(lengths.lengths, IntSet::from(vec![0, 1, 3]));
        assert_eq!(lengths.axes, 3);
        assert_eq!(lengths.opds, IntMultiset::from(vec![1, 2, 3]));
        assert!(lengths.is_demodulatable);
    }

    #[test]
    fn lengths_from_is_not_demodulatable() {
        let lengths = Lengths::from(IntSet::from(vec![0, 1, 2]));
        assert_eq!(lengths.lengths, IntSet::from(vec![0, 1, 2]));
        assert_eq!(lengths.axes, 3);
        assert_eq!(lengths.opds, IntMultiset::from(vec![1, 1, 2]));
        assert!(!lengths.is_demodulatable);
    }

    #[test]
    fn lengths_lengths() {
        let lengths = Lengths::from(IntSet::from(vec![0, 1, 3]));
        assert_eq!(*lengths.lengths(), IntSet::from(vec![0, 1, 3]));
    }

    #[test]
    fn cases_up_to() {
        let cases: Vec<_> = Cases::up_to(4, 5)
            .map(|lengths| lengths_to_vec(&lengths))
            .collect();
        let expected: Vec<Vec<usize>> = vec![
            vec![0, 1, 2, 5],
            vec![0, 1, 3, 5],
            vec![0, 1, 4, 5],
            vec![0, 2, 3, 5],
            vec![0, 2, 4, 5],
            vec![0, 3, 4, 5],
        ];
        assert_eq!(cases, expected,);
    }

    #[test]
    fn solutions_find_starting_at() {
        let solutions: Vec<_> = Solutions::find_starting_at(4, 6)
            .iter()
            .map(lengths_to_vec)
            .collect();
        let expected: Vec<Vec<usize>> = vec![vec![0, 1, 4, 6], vec![0, 2, 5, 6]];
        assert_eq!(solutions, expected);
    }
}
