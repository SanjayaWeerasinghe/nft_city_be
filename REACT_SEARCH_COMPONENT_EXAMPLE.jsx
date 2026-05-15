// Example React component for the Search functionality
// Place this in your React frontend project

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchPage = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Get the auth token from your auth context/localStorage/state management
  const getAuthToken = () => {
    return localStorage.getItem('authToken'); // Adjust based on your auth implementation
  };

  const handleSearch = async (page = 1) => {
    if (!searchText.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search-service/search`,
        {
          params: {
            searchText: searchText.trim(),
            page: page,
            itemsPerPage: itemsPerPage
          },
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.data);
        setCurrentPage(page);
      } else {
        setError(response.data.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err.response?.data?.message || 
        'An error occurred while searching. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1);
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Search Users & NFTs</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by username, NFT title, or blockchain token ID..."
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <p>Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && !loading && (
          <div className="search-results">
            {/* Results Summary */}
            <div className="results-summary">
              <h2>
                Found {searchResults.pagination.totalResults} results
                ({searchResults.pagination.totalUsers} users, {searchResults.pagination.totalNfts} NFTs)
              </h2>
            </div>

            {/* Users Section */}
            {searchResults.results.users.length > 0 && (
              <div className="users-section">
                <h3>Users ({searchResults.pagination.totalUsers})</h3>
                <div className="users-grid">
                  {searchResults.results.users.map((user) => (
                    <div key={user.user_id} className="user-card">
                      {user.profile_image && (
                        <img 
                          src={user.profile_image} 
                          alt={user.username}
                          className="user-avatar"
                        />
                      )}
                      <div className="user-info">
                        <h4>{user.display_name || user.username}</h4>
                        <p className="username">@{user.username}</p>
                        <p className="full-name">{user.full_name}</p>
                        <p className="wallet-address" title={user.public_address}>
                          {user.public_address?.substring(0, 10)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NFTs Section */}
            {searchResults.results.nfts.length > 0 && (
              <div className="nfts-section">
                <h3>NFTs ({searchResults.pagination.totalNfts})</h3>
                <div className="nfts-grid">
                  {searchResults.results.nfts.map((nft) => (
                    <div key={nft.nft_id} className="nft-card">
                      {nft.resource_url && (
                        <div className="nft-media">
                          {['jpg', 'jpeg', 'png', 'gif'].includes(nft.resource_type) ? (
                            <img 
                              src={nft.resource_url} 
                              alt={nft.title}
                              className="nft-image"
                            />
                          ) : ['mp4', 'webm'].includes(nft.resource_type) ? (
                            <video 
                              src={nft.resource_url}
                              controls
                              className="nft-video"
                            />
                          ) : null}
                        </div>
                      )}
                      <div className="nft-info">
                        <h4>{nft.title}</h4>
                        <p className="nft-description">{nft.description}</p>
                        <div className="nft-details">
                          <span className="token-id">
                            Token ID: {nft.blockchain_token_id}
                          </span>
                          <span className="creator">
                            By: @{nft.creator_username}
                          </span>
                          {nft.price && (
                            <span className="price">
                              Price: {nft.price} NUC
                            </span>
                          )}
                          <span className={`status ${nft.status}`}>
                            {nft.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {searchResults.pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {searchResults.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === searchResults.pagination.totalPages || loading}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}

            {/* No Results */}
            {searchResults.results.users.length === 0 && 
             searchResults.results.nfts.length === 0 && (
              <div className="no-results">
                <p>No results found for "{searchResults.searchText}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;


/* Basic CSS Styles (add to your CSS file) */
/*
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-form {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.search-input {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.search-button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

.search-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin: 10px 0;
}

.results-summary {
  margin: 20px 0;
}

.users-grid, .nfts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.user-card, .nft-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-avatar {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.nft-image, .nft-video {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
}

.pagination-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.pagination-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #666;
}
*/

