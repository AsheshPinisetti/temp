import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Hangout } from '../models/hangout.model';
import { Observable, catchError, combineLatest, first, map, switchMap } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { updateDoc, arrayUnion, doc } from '@firebase/firestore';
import { User } from '../models/user.model';
import { collection, getDocs, query, where, Firestore } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class HangoutService {

  constructor(private firestore: AngularFirestore,) { }

  // Create a new hangout
  public async createHangout(hangout: Hangout): Promise<boolean> {
    try {
      // Step 1: Create the document and get the doc ID
      const docRef = await this.firestore.collection('hangouts').add({...hangout, joinId:this.generateJoinId()});

      // Step 2: Update the newly created document with its ID
      await this.firestore.doc(`hangouts/${docRef.id}`).update({
        id: docRef.id
      });
      return true;
    } catch (error) {
      return false;
    }
  }


  // Generate a unique join ID for hangout
  generateJoinId() {
    // This is a simplistic implementation; consider a more robust solution
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  async addRestaurant(hangoutId: string, restaurant: Restaurant) {
    const hangoutRef = doc(this.firestore.firestore, 'hangouts', hangoutId);

    try {
      await updateDoc(hangoutRef, {
        restaurants: arrayUnion(restaurant)
      });
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  }

  // Join a hangout
  async joinHangout(joinId: string, userId: string): Promise<string | null> {
    const hangoutId = await this.getHangoutIdFromJoinId(joinId);
    if (hangoutId) {
      const hangoutRef = doc(this.firestore.firestore, 'hangouts', hangoutId);
      try {
        await updateDoc(hangoutRef, {
          participants: arrayUnion(userId)
        });
        return hangoutId;
      } catch (error) {
        console.error('Error joining hangout:', error);
        return null;
      }
    } else {
      console.error('No hangout found with the provided joinId:', joinId);
      return null;
    }
  }



  castVote(userId: string, hangoutId: string, restaurantId: string) {
    const hangoutRef = this.firestore.collection('hangouts').doc(hangoutId);

    hangoutRef.get().pipe(
      first(),
      map(hangoutSnapshot => {
        if (!hangoutSnapshot.exists) {
          throw new Error('Hangout not found');
        }

        const hangoutData = hangoutSnapshot.data() as Hangout;
        if (!hangoutData.restaurants) {
          throw new Error('No restaurants found in hangout');
        }

        // Remove existing votes for this user in all restaurants
        hangoutData.restaurants = hangoutData.restaurants.map((restaurant): Restaurant => ({
          ...restaurant,
          votes: restaurant.votes?.filter(vote => vote !== userId) || []
        }));

        // Find the restaurant and add the new vote
        const restaurantIndex = hangoutData.restaurants.findIndex(r => r.id === restaurantId);
        if (restaurantIndex === -1) {
          throw new Error('Restaurant not found in hangout');
        }

        hangoutData.restaurants[restaurantIndex].votes = hangoutData.restaurants[restaurantIndex].votes || [];
        hangoutData.restaurants[restaurantIndex].votes?.push(userId);

        return hangoutData;
      }),
      switchMap(hangoutData => {
        return hangoutRef.update({ restaurants: hangoutData.restaurants });
      }),
      catchError(error => {
        console.error('Error casting vote:', error);
        throw error;
      })
    ).subscribe({
      error: err => console.error('Error in subscription:', err)
      // You can also handle success here if needed
    });
  }

  getActiveHangoutsForUser(userId: string | undefined): Observable<Hangout[]> {
    return this.firestore.collection<Hangout>('hangouts', ref =>
      ref.where('active', '==', true).where('participants', 'array-contains', userId)
    ).valueChanges();
  }

  getPastHangoutsForUser(userId: string | undefined): Observable<Hangout[]> {
    return this.firestore.collection<Hangout>('hangouts', ref =>
      ref.where('active', '==', false).where('participants', 'array-contains', userId)
    ).valueChanges();
  }

  getHangout(hangoutId: string): Observable<any> {
    return this.firestore.doc<Hangout>(`hangouts/${hangoutId}`).valueChanges().pipe(
      switchMap(hangout => {
        if (hangout) {
          const createdBy$ = this.getUserById(hangout.createdBy);
          const participants$ = combineLatest(hangout.participants.map(id => this.getUserById(id)));

          return combineLatest([createdBy$, participants$]).pipe(
            map(([createdBy, participants]) => {
              return {
                ...hangout,
                createdBy,
                participants
              };
            })
          );
        }
        return [];
      })
    );
  }

  // Assuming you have a function to get user by ID.
  getUserById(id: string): Observable<any> {
    return this.firestore.doc<User>(`users/${id}`).valueChanges();
  }

  async getHangoutIdFromJoinId(joinId: string): Promise<string | null> {
    const hangoutQuery = query(
      collection(this.firestore.firestore, 'hangouts'),
      where('joinId', '==', joinId)
    );
    const querySnapshot = await getDocs(hangoutQuery);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    } else {
      return null;
    }
  }
}
