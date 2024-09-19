use std::ops::Index;

/// A set of integers implemented as a sorted vector.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub(crate) struct IntSet(Vec<usize>);

impl IntSet {
    /// Create a new set from the given values. Duplicates are removed.
    pub(crate) fn from(mut values: Vec<usize>) -> Self {
        values.sort();
        values.dedup();
        Self(values)
    }

    /// The number of items in the set.
    pub(crate) fn len(&self) -> usize {
        self.0.len()
    }

    /// Get the items as a slice.
    pub(crate) fn as_slice(&self) -> &[usize] {
        self.0.as_slice()
    }

    /// Iterate over the items in ascending order.
    pub(crate) fn iter(&self) -> std::slice::Iter<usize> {
        self.as_slice().iter()
    }
}

impl Index<usize> for IntSet {
    type Output = usize;

    fn index(&self, index: usize) -> &Self::Output {
        &self.0[index]
    }
}

/// A multiset of integers implemented as a sorted vector.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub(crate) struct IntMultiset(Vec<usize>);

impl IntMultiset {
    /// Create a new set from the given values.
    pub(crate) fn from(mut values: Vec<usize>) -> Self {
        values.sort();
        Self(values)
    }

    /// The number of items in the set including duplicates.
    pub(crate) fn len(&self) -> usize {
        self.0.len()
    }

    /// Test whether this is a set, meaning there are no duplicates.
    pub(crate) fn is_set(&self) -> bool {
        // Since the values are sorted only adjacent values need to be compared.
        for i in 1..self.len() {
            if self.0[i] == self.0[i - 1] {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn int_set_from() {
        assert_eq!(IntSet::from(vec![]), IntSet(vec![]));
        assert_eq!(IntSet::from(vec![1, 2, 3]), IntSet(vec![1, 2, 3]));
        assert_eq!(IntSet::from(vec![1, 2, 3, 2, 1]), IntSet(vec![1, 2, 3]));
    }

    #[test]
    fn int_set_len() {
        assert_eq!(0, IntSet::from(vec![]).len());
        assert_eq!(3, IntSet::from(vec![1, 2, 3]).len());
        assert_eq!(3, IntSet::from(vec![1, 2, 3, 2, 1]).len());
    }

    #[test]
    fn int_set_as_slice() {
        let set = IntSet::from(vec![1, 2, 3]);
        let slice = set.as_slice();
        assert_eq!(slice, [1, 2, 3]);
    }

    #[test]
    fn int_set_iter() {
        let set = IntSet::from(vec![1, 2, 3]);
        let mut it = set.iter();
        assert_eq!(it.next(), Some(1).as_ref());
        assert_eq!(it.next(), Some(2).as_ref());
        assert_eq!(it.next(), Some(3).as_ref());
        assert_eq!(it.next(), None);
    }

    #[test]
    fn int_set_index() {
        let set = IntSet::from(vec![1, 2, 5]);
        assert_eq!(set[0], 1);
        assert_eq!(set[1], 2);
        assert_eq!(set[2], 5);
    }

    #[test]
    fn intmultiset_from() {
        assert_eq!(IntMultiset::from(vec![]), IntMultiset(vec![]));
        assert_eq!(IntMultiset::from(vec![1, 2, 3]), IntMultiset(vec![1, 2, 3]));
        assert_eq!(
            IntMultiset::from(vec![1, 2, 3, 2, 1]),
            IntMultiset(vec![1, 1, 2, 2, 3])
        );
    }

    #[test]
    fn int_multiset_len() {
        assert_eq!(0, IntMultiset::from(vec![]).len());
        assert_eq!(3, IntMultiset::from(vec![1, 2, 3]).len());
        assert_eq!(5, IntMultiset::from(vec![1, 2, 3, 2, 1]).len());
    }

    #[test]
    fn int_multiset_is_set() {
        assert!(IntMultiset::from(vec![]).is_set());
        assert!(IntMultiset::from(vec![1, 2, 3]).is_set());
        assert!(!IntMultiset::from(vec![1, 2, 3, 2, 1]).is_set());
    }
}
