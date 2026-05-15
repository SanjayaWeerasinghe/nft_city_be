import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getActivityList, getOwnedCreatedItems, getOwnedEquityItems, getOwnedItems, getOwnedPendingItems, getOwnOnSaleItem, getOwnProfile, updateProfileCover } from '../../api/profile/profile';
import { Link } from 'react-router-dom';
import NFTItem from '../Layouts/NFTItem/NFTItem';
import NotLoggedInRedirection from '../Auth/NotLoggedInRedirection/NotLoggedInRedirection';

const LISTING_URL = process.env.REACT_APP_LISTING_SERVICE || 'http://localhost:4001';
const REACT_APP_PROFILE_SERVICE = process.env.REACT_APP_PROFILE_SERVICE || 'http://localhost:4002';

class MyItems extends Component {


    state = {
        profile: {
            user_name: null,
            public_address: null
        },
        itemsOnSale: {
            list: [],
            page: 1,
            loadMore: false,
            isLoading: true,
            pagination: {}
        },
        itemsOwned: {
            list: [],
            page: 0,
            loadMore: false,
            isLoading: true,

        },
        itemsCreated: {
            list: [],
            page: 0,
            loadMore: false,
            isLoading: true
        },
        itemsPending: {
            list: [],
            page: 0,
            loadMore: false,
            isLoading: true
        },
        itemsEquity: {
            list: [],
            page: 0,
            loadMore: false,
            isLoading: true
        },
        activities: {
            list: [],
            page: 0,
            loadMore: false,
            isLoading: true
        },
        imgSrc: null,
        image: null,
        isLoading: true
    }

    async componentDidMount() {
        getOwnProfile(this.props.token).then(({ data }) => {
            console.log("fetchOwnProfile", data)

            this.setState({ ...this.state, profile: data.data, isLoading: false });
        }).catch(e => { });

        getOwnOnSaleItem(this.props.token).then(({ data }) => {
            console.log("fetchOwnOnSaleItems", data.data.tokens)
            this.setState({ ...this.state, itemsOnSale: { list: data.data.tokens, loadMore: data.data.pagination.has_next_page, page: 1, isLoading: false, } });
        }).catch(e => { });
    }

    fetchOwnOnSaleItems(page = 0) {
        this.setState({ ...this.state, itemsOnSale: { ...this.state.itemsOnSale, isLoading: true } }, () => {
            getOwnOnSaleItem(this.props.token, page).then(({ data }) => {
                this.setState({ ...this.state, itemsOnSale: { list: [...this.state.itemsOnSale.list, ...data.data.tokens], loadMore: data.data.pagination.has_next_page, page: page, isLoading: false } });
            }).catch(e => { });
        })
    }

    async fetchItems(param, page = 0) {
        switch (param) {
            case 1: {
                // if(this.state.itemsOwned.list.length > 0 && page === 0) return;
                this.setState({ ...this.state, itemsOwned: { ...this.state.itemsOwned, isLoading: true } }, () => {
                    getOwnedItems(this.props.token, page).then(({ data }) => {
                        this.setState({ ...this.state, itemsOwned: { list: page === 0 ? data : [...this.state.itemsOwned.list, ...data], loadMore: data.length > 19, page: page, isLoading: false } });
                    }).catch(e => { });
                })
                break;
            }
            case 2: {
                // if(this.state.itemsCreated.list.length > 0 && page === 0) return;
                this.setState({ ...this.state, itemsCreated: { ...this.state.itemsCreated, isLoading: true } }, () => {
                    getOwnedCreatedItems(this.props.token, page).then(({ data }) => {
                        this.setState({ ...this.state, itemsCreated: { list: page === 0 ? data : [...this.state.itemsCreated.list, ...data], loadMore: data.length > 19, page: page, isLoading: false } });
                    });
                })
                break;
            }
            case 3: {
                // if(this.state.itemsPending.list.length > 0 && page === 0) return;
                this.setState({ ...this.state, itemsPending: { ...this.state.itemsPending, isLoading: true } }, () => {
                    getOwnedPendingItems(this.props.token, page).then(({ data }) => {
                        this.setState({ ...this.state, itemsPending: { list: page === 0 ? data : [...this.state.itemsPending.list, ...data], loadMore: data.length > 19, page: page, isLoading: false } });
                    })
                });
                break;
            }
            case 4: {
                // if(this.state.activities.list.length > 0 && page === 0) return;
                this.setState({ ...this.state, activities: { ...this.state.activities, isLoading: true } }, () => {
                    getActivityList(this.props.token, page).then(({ data }) => {
                        this.setState({ ...this.state, activities: { list: page === 0 ? data : [...this.state.activities.list, ...data], loadMore: data.length > 19, page: page, isLoading: false } });
                    })
                });
                break;
            }
            case 5: {
                // if(this.state.itemsPending.list.length > 0 && page === 0) return;
                this.setState({ ...this.state, itemsEquity: { ...this.state.itemsEquity, isLoading: true } }, () => {
                    getOwnedEquityItems(this.props.token, page).then(({ data }) => {
                        this.setState({ ...this.state, itemsEquity: { list: page === 0 ? data : [...this.state.itemsEquity.list, ...data], loadMore: data.length > 19, page: page, isLoading: false } });
                    })
                });
                break;
            }
        }
    }

    onUploadFile = async e => {
        try {
            const file = e.target.files[0];

            const reader = new FileReader();
            const url = reader.readAsDataURL(file);

            if ((file.size / 1024) / 1024 > 100) {
                document.getElementById('launch-modal-btn').click();
                return;
            }

            reader.onloadend = function (e) {
                this.setState({ ...this.state, isDisabled: false, imgSrc: reader.result, image: file })
            }.bind(this);
            const formData = new FormData();
            formData.append('img', file);
            await updateProfileCover(formData, this.props.token);
        } catch (e) { }
    }

    render() {
        const { user_name, public_address, profile_image, display_name, twitter_username, site_or_portfolio, cover_image } = this.props.profile;
        const { itemsOnSale, itemsOwned, itemsCreated, itemsPending, itemsEquity, activities } = this.state;

        return (
            <main>
                <section id="ItemsProfile" className="py-5 BgGrey">
                    <div className="container">
                        <div className='row' id='zIndexMob'>
                            <div className="text-center">
                                <div className="position-relative CoverImageBox">
                                    <input id="input-file" onChange={this.onUploadFile} type="file" accept="image/png, image/gif, image/jpeg" style={{ display: 'none' }} />
                                    <img style={{ height: '300px' }} src={this.state.imgSrc ? this.state.imgSrc : cover_image ? `${REACT_APP_PROFILE_SERVICE}/v1/profile/cover/${user_name}` : "/images/cover.jpeg"} alt="Cover Image" className="w-100 rounded d-block" />
                                    <button onClick={() => {
                                        document.getElementById('input-file').click();
                                    }} className="rounded-pill btn BtnBlue px-3 position-absolute">
                                        Add Cover
                                    </button>
                                </div>
                                {user_name && profile_image && <img style={{ backgroundColor: 'white', width: '120px !important', height: '120px !important' }} src={`${REACT_APP_PROFILE_SERVICE}/v1/profile/image/${user_name}`} alt="Profile Image" className="rounded-circle d-block mx-auto w-100 h-100 position-relative ProfileImg mb-3" />}
                                {user_name && !profile_image && <img style={{ backgroundColor: 'white', width: '120px !important', height: '120px !important' }} src="/images/user.png" alt="Profile Image" className="rounded-circle d-block mx-auto w-100 h-100 position-relative ProfileImg mb-3" />}
                             
                                <button style={{ width: '35%' }} className="rounded-pill TextEllipsis BgGrey px-3 GreyColor mb-3">
                                    {public_address || user_name}
                                </button>
                                {display_name && <p className="m-0"><strong>{display_name}</strong></p>}
                                {twitter_username && <p><i className="fa fa-twitter me-2" /> {twitter_username} {site_or_portfolio != null ? <React.Fragment> <i className="fa fa-globe me-2" /> {site_or_portfolio}</React.Fragment> : ''} </p>}
                            </div>
                            <div className="d-flex justify-content-center align-items-center mb-3">
                                <Link style={{ paddingTop: '9px' }} to="/user/profile/edit" className="rounded-pill btn BtnBorder px-3 shadow-none me-2 RoundButtonHeight">Edit Profile</Link>
                            </div>

                           
                            <div className="TabBox">
                                <ul className="nav nav-tabs justify-content-center BorderBottom mb-4" id="myTab" role="tablist" style={{ marginTop: "100px" }}>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="Sale-tab" data-bs-toggle="tab" data-bs-target="#Sale" type="button" role="tab" aria-controls="Sale" aria-selected="true">On Salexxx</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button onClick={this.fetchItems.bind(this, 1, 0)} className="nav-link" id="Owned-tab" data-bs-toggle="tab" data-bs-target="#Owned" type="button" role="tab" aria-controls="Owned" aria-selected="false">Owned</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button onClick={this.fetchItems.bind(this, 2, 0)} className="nav-link" id="Created-tab" data-bs-toggle="tab" data-bs-target="#Created" type="button" role="tab" aria-controls="Created" aria-selected="false">Created</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button onClick={this.fetchItems.bind(this, 3, 0)} className="nav-link" id="Pending-tab" data-bs-toggle="tab" data-bs-target="#PendingNFT" type="button" role="tab" aria-controls="Liked" aria-selected="false">Pending NFT</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button onClick={this.fetchItems.bind(this, 4, 0)} className="nav-link d-none" id="Activity-tab" data-bs-toggle="tab" data-bs-target="#Activity" type="button" role="tab" aria-controls="Activity" aria-selected="false">Activity</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button onClick={this.fetchItems.bind(this, 5, 0)} className="nav-link" id="Activity-tab" data-bs-toggle="tab" data-bs-target="#Equity" type="button" role="tab" aria-controls="Equity" aria-selected="false">Equity</button>
                                    </li>
                                   
                                </ul>
                                <div className="tab-content MarketDataCard" id="myTabContent">
                                    <div className="tab-pane fade show active" id="Sale" role="tabpanel" aria-labelledby="Sale-tab">
                                        {
                                            !itemsOnSale.isLoading && itemsOnSale.list.length === 0 ? (
                                                <Link to="/">
                                                    <div className="text-md-center py-5">
                                                        <h2>No Sales items found</h2>
                                                        <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                                        <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="d-flex justify-content-center flex-wrap">
                                                    {
                                                        !itemsOnSale.isLoading && itemsOnSale.list.map(data => <NFTItem key={data.payload} item={data} />)
                                                    }
                                                    {
                                                        itemsOnSale.isLoading && new Array(10).fill(1).map((_, index) => <NFTItem key={index} />)
                                                    }
                                                    <div className="w-100">
                                                        <center>
                                                            {this.state.itemsOnSale.loadMore && <button onClick={() => this.fetchOwnOnSaleItems(this.state.itemsOnSale.page + 1)} disabled={itemsOnSale.isLoading} style={{ width: '30%' }} className="btn BtnBlack">Load More {itemsOnSale.isLoading && <i className="fas fa-asterisk fa-spin" />}</button>}
                                                        </center>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="Owned" role="tabpanel" aria-labelledby="Owned-tab">
                                        {
                                            !itemsOwned.isLoading && itemsOwned.list.length === 0 ? (
                                                <Link to="/">
                                                    <div className="text-md-center py-5">
                                                        <h2>No Owned items found</h2>
                                                        <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                                        <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="d-flex justify-content-center flex-wrap">
                                                    {
                                                        itemsOwned.list.map(data => <NFTItem key={data.payload} item={data} />)
                                                    }
                                                    {
                                                        itemsOwned.isLoading && new Array(10).fill(1).map((_, index) => <NFTItem key={index} />)
                                                    }
                                                    <div className="w-100">
                                                        <center>
                                                            {itemsOwned.loadMore && <button onClick={() => this.fetchItems(1, itemsOwned.page + 1)} disabled={itemsOwned.isLoading} style={{ width: '30%' }} className="btn BtnBlack">Load More {itemsOwned.isLoading && <i className="fas fa-asterisk fa-spin" />}</button>}
                                                        </center>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="Created" role="tabpanel" aria-labelledby="Created-tab">
                                        {
                                            !itemsCreated.isLoading && itemsCreated.list.length === 0 ? (
                                                <Link to="/">
                                                    <div className="text-md-center py-5">
                                                        <h2>No Created items found</h2>
                                                        <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                                        <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="d-flex justify-content-center flex-wrap">
                                                    {
                                                        itemsCreated.list.map(data => <NFTItem key={data.payload} item={data} />)
                                                    }
                                                    {
                                                        itemsCreated.isLoading && new Array(10).fill(1).map((_, index) => <NFTItem key={index} />)
                                                    }
                                                    <div className="w-100">
                                                        <center>
                                                            {itemsCreated.loadMore && <button onClick={() => this.fetchItems(2, itemsCreated.page + 1)} disabled={itemsCreated.isLoading} style={{ width: '30%' }} className="btn BtnBlack">Load More {itemsCreated.isLoading && <i className="fas fa-asterisk fa-spin" />}</button>}
                                                        </center>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="PendingNFT" role="tabpanel" aria-labelledby="Pending-tab">
                                        {
                                            !itemsPending.isLoading && itemsPending.list.length === 0 ? (
                                                <Link to="/">
                                                    <div className="text-md-center py-5">
                                                        <h3>No Pending items found</h3>
                                                        <p className="GreyColor Fsize_16">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                                        <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="d-flex justify-content-center flex-wrap">
                                                    {
                                                        itemsPending.list.map(data => <NFTItem key={data.payload} item={data} />)
                                                    }
                                                    {
                                                        itemsPending.isLoading && new Array(10).fill(1).map((_, index) => <NFTItem key={index} />)
                                                    }
                                                    <div className="w-100">
                                                        <center>
                                                            {itemsPending.loadMore && <button onClick={() => this.fetchItems(3, itemsPending.page + 1)} disabled={itemsPending.isLoading} style={{ width: '30%' }} className="btn BtnBlack">Load More {itemsPending.isLoading && <i className="fas fa-asterisk fa-spin" />}</button>}
                                                        </center>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="Activity" role="tabpanel" aria-labelledby="Activity-tab">
                                        <div className="py-5">
                                            <table className="table mb-3">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Token ID</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Price / Bid Amount</th>
                                                        <th scope="col">Order ID</th>
                                                        <th scope="col">Minted Hash</th>
                                                        <th scope="col">Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        activities.list.map(data => (
                                                            <tr>
                                                                <th scope="row">{data.token_id}</th>
                                                                <td className="shadows">
                                                                    <img className="pictures" src="https://api.vulcanstats.io/data/Vulcan/imgMaps/NFT26820.png" />
                                                                    <a className="wolf px-2">{data.title}</a>
                                                                </td>
                                                                <td>{!data.bid_amount ? data.price ? data.price : '-' : '-'} / {data.bid_amount || '-'}</td>
                                                                <td>{data.order_id}</td>
                                                                <td>{data.nft_minted_hash}</td>
                                                                <td>
                                                                    <span>01:08 28-Feb-2022</span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }


                                                </tbody>
                                            </table>
                                            <nav aria-label="Page navigation example">
                                                <ul className="pagination justify-content-end">
                                                    <li className="page-item"><a className="page-link" href="#">Previous</a>
                                                    </li>
                                                    <li className="page-item"><a className="page-link" href="#">1</a></li>
                                                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                                                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                                                    <li className="page-item"><a className="page-link" href="#">Next</a></li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Equity" role="tabpanel" aria-labelledby="Pending-tab">
                                        {
                                            !itemsEquity.isLoading && itemsEquity.list.length === 0 ? (
                                                <Link to="/">
                                                    <div className="text-md-center py-5">
                                                        <h2>No Equity items found</h2>
                                                        <p className="GreyColor Fsize_16">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                                        <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="d-flex justify-content-center flex-wrap">
                                                    {
                                                        itemsEquity.list.map(data => <NFTItem key={data.payload} item={data} />)
                                                    }
                                                    {
                                                        itemsEquity.isLoading && new Array(10).fill(1).map((_, index) => <NFTItem key={index} />)
                                                    }
                                                    <div className="w-100">
                                                        <center>
                                                            {itemsEquity.loadMore && <button onClick={() => this.fetchItems(3, itemsEquity.page + 1)} disabled={itemsEquity.isLoading} style={{ width: '30%' }} className="btn BtnBlack">Load More {itemsEquity.isLoading && <i className="fas fa-asterisk fa-spin" />}</button>}
                                                        </center>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="Following" role="tabpanel" aria-labelledby="Following-tab">
                                        <div className="text-md-center py-5">
                                            <h2>No Following items found</h2>
                                            <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                            <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Follower" role="tabpanel" aria-labelledby="Follower-tab">
                                        <div className="text-md-center py-5">
                                            <h2>No Follower items found</h2>
                                            <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                            <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Hidden" role="tabpanel" aria-labelledby="Hidden-tab">
                                        <div className="text-md-center py-5">
                                            <h2>No Hidden items found</h2>
                                            <p className="GreyColor">Come back soon! Or try to browse <br /> something for you on our marketplace</p>
                                            <a href="#" className="btn BtnBlack py-2 px-3">Browse Marketplace</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <NotLoggedInRedirection />
            </main>
        )
    }
}

const mapStateToProps = state => ({
    token: state.Auth.token,
    profile: state.Profile.profile
})

export default connect(mapStateToProps, {})(MyItems);